(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@/util/index.js'), require('@/util/options.js'), require('src/core/util')) :
    typeof define === 'function' && define.amd ? define(['@/util/index.js', '@/util/options.js', 'src/core/util'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.XVue = factory(global.index_js, null, global.util));
}(this, (function (index_js, options_js, util) { 'use strict';

    const bailRE = /[^\w.$]/;
    function parsePath(path) {
      if (bailRE.test(path)) {
        return;
      }

      const segments = path.split('.');
      return function (obj) {
        for (let i = 0; i < segments.length; i++) {
          if (!obj) return;
          obj = obj[segments[i]];
        }

        return obj;
      };
    }

    const hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwn(obj, key) {
      return hasOwnProperty.call(obj, key);
    }
    function isObject(obj) {
      return obj !== null && typeof obj === 'object';
    }
    function isPlainObject(obj) {
      return Object.prototype.toString.call(obj) === '[object Object]';
    }
    /**
     * Define a property.
     */

    function def(obj, key, val, enumerable) {
      Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
      });
    }

    let uid$2 = 0;
    class Dep {
      constructor() {
        this.id = uid$2++;
        this.subs = [];
      }

      depend() {
        if (Dep.target) {
          Dep.target.addDep(this);
        }
      }

      notify() {
        const subs = this.subs.slice();

        for (let i = 0, l = subs.length; i < l; i++) {
          // subs中收集的是观察者实例
          subs[i].update();
        }
      }

      addSub(sub) {
        this.subs.push(sub);
      }

      removeSub(sub) {
        index_js.remove(this.subs, sub);
      }

    }
    Dep.target = null;
    const targetStack = [];
    function pushTarget(_target) {
      if (Dep.target) {
        targetStack.push(Dep.target);
      }

      Dep.target = _target;
    }
    function popTarget() {
      Dep.target = targetStack.pop();
    }

    const callbacks = [];
    let pending = false;

    function flushCallbacks() {
      pending = false;
      const copies = callbacks.slice(0);
      callbacks.length = 0;

      for (let i = 0; i < copies.length; i++) {
        copies[i]();
      }
    }

    let timerFunc; // we'd better use micro tasks
    // if promise is not supported, use marco task instead

    if (typeof Promise !== 'undefined') {
      const p = Promise.resolve();

      timerFunc = () => {
        p.then(flushCallbacks);
      };
    } else {
      // fallback to macro
      timerFunc = () => {
        setTimeout(flushCallbacks, 0);
      };
    }

    function nextTick(cb, ctx) {

      callHook.push(() => {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      });

      if (!pending) {
        pending = true;
        timerFunc();
      }
    }

    const queue = [];
    let has = {};
    let flushing = false;
    let waiting = false;
    let index = 0;

    function flushSchedulerQueue() {
      flushing = true;
      let watcher, id; // Sort queue before flush
      // 1. Components are updated from parent to child. (because parent is always
      //    created before the child)
      // 2. A component's user watchers are run before its render watcher (because
      //    user watchers are created before the render watcher)
      // 3. If a component is destroyed during a parent component's watcher run,
      //    its watchers can be skipped.

      queue.sort((a, b) => a.id - b.id);

      for (index = 0; index < queue.length; index++) {
        watcher = queue[index];
        id = watcher.id;
        has[id] = null;
        watcher.run();
      }
    } // queue中的所有观察者会在突变完成之后同一执行更新


    function queueWatcher(watcher) {
      const id = watcher.id; // has[id] 用来避免重复入队的

      if (has[id] == null) {
        has[id] = true;

        if (!flushing) {
          //将观察放入队列中
          queue.push(watcher);
        } // queue the flush 


        if (!waiting) {
          waiting = true; // if( !config.async){
          //  同步执行
          //     flushSchedulerQueue()   
          // }            

          nextTick(flushSchedulerQueue);
        }
      }
    }

    let uid$1 = 0;
    class Watcher {
      constructor(vm, expOrFn, cb, options, isRenderWatcher) {
        // 每个watcher实例都有一个vm，指向它对应的组件
        this.vm = vm;

        if (isRenderWatcher) {
          vm._watcher = this;
        } else {
          vm._watchers.push(this);
        }

        this.expression = expOrFn.toString();

        if (options) {
          this.deep = !!options.deep;
          this.lazy = !!options.lazy;
          this.computed = !!options.computed;
          this.sync = !!options.sync;
          this.before = !!options.before;
        }

        this.cb = cb;
        this.id = ++uid$1;
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();

        if (typeof expOrFn == 'function') {
          this.getter = expOrFn;
        } else {
          this.getter = parsePath(expOrFn);
        }

        this.value = this.get();
      }

      get() {
        pushTarget(this);
        const vm = this.vm;
        this.getter.call(vm, vm);
        popTarget();
        this.cleanupDeps();
      }

      addDep(dep) {
        const id = dep.id; // 避免重复收集依赖

        if (!this.newDepIds.has(id)) {
          this.newDepIds.add(id);
          this.newDeps.push(id);

          if (!this.depIds.has(id)) {
            dep.addSub(this);
          }
        }
      }

      update() {
        if (this.sync) {
          // 是否进行同步更新
          this.run();
        } else {
          // 渲染函数的观察者将观察者对象放到一个异步更新队列中
          queueWatcher(this);
        }
      }

      run() {
        // 异步和同步都是通过调用run()进行更新变化
        const value = this.get();

        if (value !== this.value || isObject(value)) {
          // set new value
          const oldValue = this.value;
          this.value = value;
          this.cb.call(this.vm, value, oldValue);
        }
      }

      cleanupDeps() {
        let i = this.deps.length;

        while (i--) {
          const dep = this.deps[i];

          if (!this.newDepIds.has(dep.id)) {
            dep.removeSub(this);
          }
        }

        let tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps; // 总是保持上一次求值中收集的Dep实例对象

        this.newDeps = tmp;
        this.newDeps.length = 0;
      }

    }

    function initLifecycle(vm) {
      vm.$options;
      vm._watcher = null;
      vm._isMounted = false;
      vm._isDestroyed = false;
    }
    function callHook$1(vm, hook) {
      const handlers = vm.$options[hook];

      if (handlers) {
        handlers.call(vm);
      }
    } // 完成挂载工作

    function mountComponent(vm, el, hydrating) {
      vm.$el = el;
      callHook$1(vm, 'beforMount');
      let updateComponent; // updateComponent把渲染函数生成的虚拟DOM渲染成真正的DOM

      updateComponent = () => {
        // vm._render() 生成vnode
        // vm._update() 通过虚拟DOM的补丁算法来完成
        // vm._update(vm._render(),hydrating)
        console.log("执行渲染函数生成vnode， 将vnode转化为真实dom");
      }; // 渲染函数的watcher


      new Watcher(vm, updateComponent, {});

      if (vm.$vnode == null) {
        vm._isMounted = true;
        callHook$1(vm, 'mounted');
      }

      return vm;
    }

    function initEvents(vm) {
      vm._events = Object.create(null);
    }

    // 数据代理  this.example  即是访问 this._data.example
    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get() {
          return vm[target][key];
        },

        set(val) {
          vm[target][key] = val;
        }

      });
    } // export function proxy(target, sourceKey, key) {
    //     sharedPropertyDefinition.get = function proxyGetter() {
    //         return target[sourceKey][key];
    //     }
    //     sharedPropertyDefinition.set = function proxySetter(newVal) {
    //         return target[sourceKey][key] = newVal;
    //     }
    //     Object.defineProperty(target, key, sharedPropertyDefinition);
    // }

    class Observer {
      constructor(value) {
        this.value = value;
        this.dep = new Dep();
        def(value, '__ob__', this);
        console.log("+============", value);

        if (Array.isArray(value)) {
          const augment = protoAugment;
          augment(value, arrayMethods, arrayKeys); // 使嵌套的数据也是响应式的

          this.observeArray(value);
        } else {
          this.walk(value);
        }
      }
      /**
       * 遍历obj, 给每个属性都设置响应式子
       * @param {*} obj 
       */


      walk(obj) {
        const keys = Object.keys(obj);

        for (let i = 0; i < keys.length; i++) {
          defineReactive(obj, keys[i], obj[keys[i]]);
        }
      }

      observeArray(array) {
        for (let i = 0, l = array.length; i < l; i++) {
          observe(array[i]);
        }
      }

    }

    function protoAugment(target, src, key) {
      target.__proto__ = src;
    }

    function observe(value) {
      // if(!isObject(value) || value instanceof VNode){
      //     return 
      // }    
      let ob;

      if (hasOwn(value, '__ob__') && value.__ob__ instanceof Oberserver) {
        ob = value.__ob__;
      } else if (Array.isArray(value) || isPlainObject(value) && !value._isVue) {
        try {
          ob = new Observer(value);
        } catch (e) {
          console.log("++++++++++", ob);
        }
      }

      return ob;
    }
    function defineReactive(obj, key, val) {
      const dep = new Dep(); // 默认深度观测

      let childOb = observe(val);
      let value = val;
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
          // const value = getter? getter.call(obj): val
          if (Dep.target) {
            dep.depend();

            if (childOb) {
              /**
               * 假设 childOb = observe(a)
               * childOb = a.__ob__
               * 则以下 a.__ob__.dep.depend                     
              */
              childOb.dep.depend(); // 数组的索引不是响应式的，需要为子元素手动收集依赖

              if (Array.isArray(value)) {
                dependArray(value);
              }
            }
          }

          return value;
        },
        set: function reactiveSetter(newVal) {
          // const value = getter? getter.call(obj): val
          if (newVal == value) {
            return;
          }

          value = newVal;
          childOb = observe(newVal);
          dep.notify();
        }
      });
    }
    /**
     * Collect dependencies on array elements when the array
     *  is touched, since we cannpt intercept array element access
     * lick proerty getters.
    */

    function dependArray(value) {
      for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i];
        e && e.__ob__ && e.__ob__.dep.depend();

        if (Array.isArray(e)) {
          dependArray(e);
        }
      }
    }

    function initState(vm) {
      vm._watchers = [];
      const opts = vm.$options;
      if (opts.props) initProps(vm, opts.props); // if(opts.methods) initMethods(vm,opts.methods)

      if (opts.data) {
        initData(vm);
      } else {
        observe(vm._data = {}, tru);
      }

      if (opts.computed) initComputed(vm, opts.computed);

      if (opts.watch && opts.watch !== nativeWatch) {
        initWatch(vm, opts.watch);
      }
    }

    function initData(vm) {
      let data = vm.$options.data;
      data = vm._data = typeof data == 'function' ? getData(data, vm) : data || {}; // proxy data on instance

      const keys = Object.keys(data);
      const props = vm.$options.props;
      const methods = vm.$options.methods;
      let i = keys.length;

      while (i--) {
        const key = keys[i];

        if (methods && hasOwn(methods, key)) {
          util.warn(`Method "${key}" has already been defined as a data property`, vm);
        }

        if (props && hasOwn(props, key)) {
          util.warn(`The data property "${key}" is already declared as a pro` + `Use prop default value instand`, vm);
        } else {
          proxy(vm, `_data`, key);
        }
      }

      observe(data);
    }

    function getData(data, vm) {
      try {
        return data.call(vm);
      } catch (e) {
        console.error(e, vm, `data()`);
        return {};
      }
    }

    // createCompier = _Creator(baseCompile)
    // baseCompile的返回值 {ast,render}
    function createCompilerCreator(baseCompile) {
      return function createCompier(baseOptions) {
        function compile(template, options) {
          const compiled = baseCompile(template.trim(), finalOptions);
          console.log("嘻嘻哈哈-----", compiled);
          return compiled;
        }

        return {
          compile,
          compileToFunction: createCompileToFunctionFn(compile)
        };
      };
    }

    function createCompileToFunctionFn(compile) {
      const cache = Object.create(null); // compileToFunctions生成的是真正可执行的代码

      return function compileToFunctions(template, options, vm) {
        // options = extend({},options)        
        // options = Object.create(options)              
        options = {};
        const key = template;

        if (cache[key]) {
          return cache[key];
        }

        const compiled = compile(template, options);
        const res = {};
        const fnGenErrors = [];
        res.render = createFunction(compiled.render, fnGenErrors); // console.log("看一下咯……………………………………………………………………",res.render);

        return cache[key] = res;
      };
    }

    function createFunction(code, errors) {
      try {
        return new Function(code);
      } catch (err) {
        errors.push({
          err,
          code
        });
        return noop;
      }
    }

    /**
     * Make a map and return a function for checking if 
     * a key is in that map.
     */
    function makeMap(str, expectsLowerCase) {
      const map = Object.create(null);
      const list = str.split(',');

      for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
      }

      return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val];
    }

    /* @flow */
    const baseOptions = {
      expectHTML: true,
      modules,
      isUnaryTag,
      canBeLeftOpenTag
    };
    const isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr'); // Elements that you can, intentionally, leave open
    // (and which close themselves)

    const canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'); // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
    // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content

    makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' + 'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' + 'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' + 'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' + 'title,tr,track');

    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
    // but for Vue templates we can enforce a simple charset

    const ncname = '[a-zA-Z_][\\w\\-\\.]*';
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
    const startTagOpen = new RegExp(`^<${qnameCapture}`);
    const startTagClose = /^\s*(\/?)>/;
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

    const comment = /^<!\--/;
    const isPlainTextElement = makeMap('script,style,textarea', true);
    function parseHTML(html) {
      const stack = [];
      options.expectHTML;
      let index = 0;
      let lastTag;

      while (html) {
        if (!lastTag || !isPlainTextElement(lastTag)) {
          let textEnd = html.indexOf('<');

          if (textEnd == 0) {
            /** 1. <!--注释-->
             *  2. <div> 开始标签的开始部分</div>  ---- <div>
             *  3. <div> 开始标签的结束部分</div>  ---- </div>
             *  4. <absdc  纯文本
            */
            if (comment.test(html)) {
              // 可能是注释节点
              const commentEnd = html.indexOf('-->');
              options.comment(html.substring(4, commentEnd)); // 截取注释的内容

              advance(commentEnd + 3);
              continue;
            }
            /**
             * 开始标签要求： 1、 匹配到 <tag>  (如果是 <tag 则不行)
             *               2\ <tag attribute>
            */


            const startTagMatch = parseStartTag();

            if (startTagMatch) {
              handleStartTag(startTagMatch);
            }

            continue;
          } // =0 <2sfd3


          let text, rest, next;

          if (textEnd >= 0) {
            rest = html.slice(textEnd);

            while (!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest)) {
              next = rest.indexOf('<', 1);
              if (next < 0) break;
              textEnd += next;
              rest = html.slice(textEnd);
            }

            text = html.substring(0, textEnd);
            advance(textEnd);
          }

          if (textEnd < 0) {
            text = html;
            html = '';
          }

          if (options.chars && text) {
            options.chars(text);
          }

          if (!stack.length && options.warn) {
            options.warn(`Mal-formatted tag at end of template: "${html}"`);
          }
        } else {
          // <script> <style> <textarea> 纯文本
          let endTagLength = 0;
          const stackedTag = lastTag.toLowerCased();
          /** 当stackedTag = textarea时
           *  resStacked的作用是用来匹配纯文本标签内容及结束标签的 xxxxx</textarea>
          */

          const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(<?' + stackedTag + '[^>]*>)', 'i'));
          const rest = html.replace(reStackedTag, function (all, text, endTag) {
            /** all: 陪陪到的字符串
            *  text: 匹配到的第一个子分组
            *  eg:xxxxx</textarea> 则 text就是xxxx; endTag就是 </textarea>
            */
            endTagLength = endTag.length;

            if (options.chars) {
              options.chars(text);
            }

            return '';
          });
          index += html.length - rest.length;
          html = rest;
          parseEndTag(stackedTag, index - endTagLength, index);
        }
      }

      function advance(n) {
        index += n;
        html = html.substring(n);
      }

      function parseStartTag() {
        let start = html.match(startTagOpen); // 匹配开始标签的开始部分

        if (start) {
          // 匹配到了 <tag   可能是开始标签
          const match = {
            tagName: start[1],
            attrs: [],
            start: index
          };
          advance(start[0].length);
          let end, attr; // 没有匹配到 /> 和 > 情况下，一直匹配属性

          while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            match.attrs.push(attr);
          }

          if (end) {
            /**
             * <div/>  end = ['/>', '>']
             * <div >  end = ['>', undefined]
            */
            match.unarySlash = end[1]; // undefined说明是非一元标签

            advance(end[0].length);
            match.end = index; // 给match增加一个end属性

            return match;
          }
        }
      }

      function handleStartTag(match) {
        /** 匹配到<div>或 <div/>
         * 
        */
        const tagName = match.tagName;
        const unarySlash = match.unarySlash;
        const unary = isUnaryTag(tagName) || !!unarySlash;
        const l = match.attrs.length;
        const attrs = new Array(l);

        for (let i = 0; i < l; i++) {
          const args = match.attrs[i];
          const value = args[3] || args[4] || args[5] || '';
          attrs[i] = {
            name: args[1],
            value: value
          };
        }

        if (!unary) {
          stack.push({
            tag: tagName,
            lowerCasedTag: tagName.toLowerCased,
            attrs: attrs
          });
          lastTag = tagName;
        }

        if (options.start) {
          options.start(tagName, attrs, unary, match.start, match.end);
        }
      }
    }

    // parse在词法分析的基础上做句法分析

    function parse(template, options) {
      // 词法分析
      parseHTML(template);
      return root;
    }

    // creatCompilerCreator根据baseCompile创建出不同平台编译器

    const createCompier = createCompilerCreator(function baseCompile(template, options) {
      // 抽象语法树
      const ast = parse(template.trim());
      optimize(ast, options);
      const code = generate(ast, options);
      return {
        ast,
        render: code.render
      };
    }); // 执行createCompier 生产 compileToFunction等函数
    // compile函数生成的是字符串形式的代码，compileToFunctions生成的是真正可执行的代码

    const {
      compile,
      compileToFunction
    } = createCompier(baseOptions);

    /**
     * XVue的生命周期：
     *  从new XVue创建、初始化数据、编译模板、挂载DOM和渲染、更新和渲染、卸载等的一系列过程 
     *  */

    function XVue(options) {
      this._init(options);
    }

    let uid = 0;

    XVue.prototype._init = function (options) {
      const vm = this;
      vm.uid = uid++;
      vm.$options = options; // vm.$options = mergeOptions(
      //     Vue.options,
      //     options || {},
      //     vm
      // )

      vm.$options = options;
      initLifecycle(vm);
      initEvents(vm); // 调用生命周期的钩子函数    

      callHook$1(vm, 'beforeCreate'); //initInjections(vm) // resolve injections before data/props

      initState(vm); // initProvide(vm) // resolve provide after data/props

      callHook$1(vm, 'created'); //   

      if (vm.$options.el) {
        vm.$mount(vm, vm.$options.el);
      }
    }; // hydrating 用于Virtual DOM补丁算法


    XVue.prototype.$mount = (vm, el, hydrating) => {
      el = el && document.querySelector(el);
      const options = vm.$options;

      if (!options.render) {
        // render函数不存在,使用template, template不存在=>el
        let template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        }

        const {
          render
        } = compileToFunction(template, {}, vm);
        options.render = render;
      } // 如render存在，调用mountComponent
      //    return mount.call(this, el, hydrating)


      mountComponent(vm, el);
    };

    return XVue;

})));
