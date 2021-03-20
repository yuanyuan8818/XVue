(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@/util/index.js'), require('@/util/options.js'), require('src/core/util'), require('web/util/style')) :
    typeof define === 'function' && define.amd ? define(['@/util/index.js', '@/util/options.js', 'src/core/util', 'web/util/style'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.XVue = factory(global.index_js, null, global.util, global.style$1));
}(this, (function (index_js, options_js, util, style$1) { 'use strict';

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

    function warn$2(msg, vm) {
      console.error(`[XVue warn]: ${msg}`, warn$2);
    }
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwn(obj, key) {
      return hasOwnProperty.call(obj, key);
    }
    function isObject$1(obj) {
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

      callbacks.push(() => {
        try {
          cb.call(ctx);
        } catch (e) {
          console.error(`[XVue error]: `, e);
        }
      });

      if (!pending) {
        pending = true;
        timerFunc();
      }
    }

    const queue = [];
    let flushing = false;
    let waiting = false;
    let index = 0;

    function flushSchedulerQueue() {
      flushing = true;
      let watcher; // Sort queue before flush
      // 1. Components are updated from parent to child. (because parent is always
      //    created before the child)
      // 2. A component's user watchers are run before its render watcher (because
      //    user watchers are created before the render watcher)
      // 3. If a component is destroyed during a parent component's watcher run,
      //    its watchers can be skipped.

      queue.sort((a, b) => a.id - b.id);

      for (index = 0; index < queue.length; index++) {
        watcher = queue[index];
        watcher.id;
        watcher.run();
      }

      waiting = false;
    } // queue中的所有观察者会在突变完成之后同一执行更新


    function queueWatcher(watcher) {
      const id = watcher.id;
      console.log("观察者的 id", id); // has[id] 用来避免重复入队的

      if (!flushing) {
        //将观察放入队列中
        queue.push(watcher);
      } // queue the flush 


      if (!waiting) {
        waiting = true; // if( !config.async){
        //  同步执行
        //     flushSchedulerQueue()   
        // }            

        console.log("等~~");
        nextTick(flushSchedulerQueue);
      } // }

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

        if (value !== this.value || isObject$1(value)) {
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

          if (!this.newDepIds.has(dep.id)) ;
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
    function callHook(vm, hook) {
      const handlers = vm.$options[hook];

      if (handlers) {
        for (let i = 0, j = handlers.length; i < j; i++) {
          try {
            handlers[i].call(vm);
          } catch (e) {
            console.error(`[XVue]:  ${hook} hook`);
          }
        }
      }
    } // 挂载

    function mountComponent(vm, el, hydrating) {
      vm.$el = el;
      callHook(vm, 'beforeMount');
      let updateComponent; // updateComponent把渲染函数生成的虚拟DOM渲染成真正的DOM

      updateComponent = () => {
        const vnode = vm._render();

        console.log("vnode: ", vnode);

        vm._update(vnode, hydrating);
      }; // 渲染函数的watcher


      new Watcher(vm, updateComponent, {});

      if (vm.$vnode == null) {
        vm._isMounted = true;
        callHook(vm, 'mounted');
      }

      return vm;
    }

    function initEvents(vm) {
      vm._events = Object.create(null);
    }

    function createTextVNode(text) {
      return {
        _isVNode: true,
        flags: VNodeFlags.TEXT,
        tag: null,
        data: null,
        children: text
      };
    }
    const VNodeFlags = {
      // html标签  0000 0001
      ELEMENT_HTML: 1,
      // SVG 标签  0000 0010
      ELEMENT_SVG: 1 << 1,
      // 普通有状态组件 0000 0100
      COMPONENT_STATEFUL_NORMAL: 1 << 2,
      // 需要被keepAlive的有状态组件 0000 1000
      COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,
      // 已经被keepAlive的有状态组件 0001 0000
      COMPONENT_STATEFUL_KEPT_ALIVE: 1 << 4,
      // 函数式组件 0010 0000
      COMPONENT_FUNCTIONAL: 1 << 5,
      //纯文本
      TEXT: 1 << 6
    }; //html 和 svg都是标签元素，都可以用ELMENT标识

    VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG; // 有状态组件： 普通有状态组件, 需要被keepAlive和已经被keptAlive的组件

    VNodeFlags.COMPONENT_STATEFUL = VNodeFlags.COMPONENT_STATEFUL_NORMAL | VNodeFlags.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE | VNodeFlags.COMPONENT_STATEFUL_KEPT_ALIVE; // 有条件组件和函数式组件都是组件

    VNodeFlags.COMPONENT = VNodeFlags.COMPONENT_STATEFUL | VNodeFlags.COMPONENT_FUNCTIONAL;
    const ChildrenFlags = {
      // 未知的children类型
      UNKNOWN_CHILDREN: 0,
      // 没有children
      NO_CHILDREN: 1,
      // children是单个VNode
      SINGLE_VNODE: 1 << 1,
      //children是拥有多个key的VNode
      KEYED_VNODES: 1 << 2,
      // children是没有key的VNode
      NONE_KEYED_VNODES: 1 << 3
    };
    ChildrenFlags.MULTIPLE_VNODES = ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES;
    /**
     * h函数即_c, 用于生产vnode
    */

    function h(tag, data = null, children = null, chldrenDeep) {
      let flags = null;

      if (typeof tag == 'string') {
        flags = tag == 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML;
      } else if (tag == Fragment) {
        flags = VNodeFlags.FRAGMENT;
      } else {
        // 兼容 Vue2 的对象式组件
        if (tag !== null && typeof tag === 'object') {
          flags = tag.functional ? VNodeFlags.COMPONENT_FUNCTIONAL // 函数式组件
          : VNodeFlags.COMPONENT_STATEFUL_NORMAL; // 有状态组件
        } else if (typeof tag === 'function') {
          // Vue3 的类组件
          flags = tag.prototype && tag.prototype.render ? VNodeFlags.COMPONENT_STATEFUL_NORMAL // 有状态组件
          : VNodeFlags.COMPONENT_FUNCTIONAL; // 函数式组件
        }
      }

      let childFlags = null;
      console.log("^^^^^^^^^^^^^^^^^^^^: children", children);

      if (Array.isArray(children)) {
        let {
          length
        } = children;

        if (length == 0) {
          // 没有children
          childFlags = ChildrenFlags.NO_CHILDREN;
        } else if (length == 1) {
          // 单个子节点
          childFlags = ChildrenFlags.SINGLE_VNODE;
          children = children[0];
        } else {
          // 多个子节点，切子节点使用key
          childFlags = ChildrenFlags.KEYED_VNODES; // children = normalizeVNodes(children)            
        }
      } else if (children == null) {
        // 没有子节点
        childFlags = ChildrenFlags.NO_CHILDREN;
      } else if (children) {
        // if(children._isVNode)
        // 单个子节点
        childFlags = ChildrenFlags.SINGLE_VNODE;
      } else {
        childFlags = ChildrenFlags.SINGLE_VNODE;
        children = createTextVNode(children + '');
      }

      console.log("dddddddddd");
      let vnode = {
        _isVNode: true,
        flags,
        tag,
        data,
        children,
        childFlags,
        el: null
      }; // console.log("看下蹙额你**********************",vnode);

      return vnode; // return {
      //     _isVNode: true,
      //     flags,
      //     tag,
      //     data,
      //     children,
      //     childFlags,
      //     el:null
      // }
    } // export function createElement(){
    // }
    // 按位运算
    //   // VNode 是普通标签
    //   mountElement(/* ... */)
    // } else if (flags & VNodeFlags.COMPONENT) {
    //   // VNode 是组件
    //   mountComponent(/* ... */)
    // } else if (flags & VNodeFlags.TEXT) {
    //   // VNode 是纯文本
    //   mountText(/* ... */)
    // }

    /**
     * help to render v-for lists
    */
    function renderList(val, render) {
      let ret, i, l, keys, key;

      if (Array.isArray(val) || typeof val == 'string') {
        ret = new Array(val.length);

        for (i = 0, l = val.length; i < l; i++) {
          ret[i] = render(val[i], i);
        }
      } else if (typeof val === 'number') {
        ret = new Array(val);

        for (i = 0; i < val; i++) {
          ret[i] = render(i + 1, i);
        }
      } else if (isObject(val)) {
        keys = Object.keys(val);
        ret = new Array(keys.length);

        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }

      if (ret == null) {
        ret = [];
      }

      return ret;
    }

    const no = () => false;
    makeMap('slot,component', true);
    const emptyObject = Object.freeze({});
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
    /**
    * Create a cached version of a pure function
    * 为一个纯函数创建一个缓存版本的函数
    * 纯函数： 输入不变则输出不变
    */

    function cached(fn) {
      const cache = Object.create(null);
      return function cachedFn(str) {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
      };
    }
    function toString(val) {
      console.log("看看这里的数据版》》 找找val", val);
      return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
    }

    function installRenderHelpers(target) {
      target._v = createTextVNode;
      target._s = toString;
      target._c = h;
      target._l = renderList;
    }

    const domPropsRE$1 = /\[A-Z]|^(?:value|checked|selected|muted)$/;
    function mountElement(vnode, container, refVNode) {
      const el = document.createElement(vnode.tag);
      vnode.el = el; // 将vnodeData应用到元素上        

      const data = vnode.data.attrs || vnode.data;
      console.log("====^^^^^^^^^^^^^^==========^^^^^^^^^^^^^======", vnode.data);

      if (data) {
        for (let key in data) {
          // key可能是calss style on 等等            
          switch (key) {
            case 'style':
              el.style = data.style;
              break;

            case 'class':
              el.className = data[key];
              break;

            default:
              if (key[0] === 'o' && key[1] == 'n') {
                el.addEventListener(key.slice(2), data[key]);

                if (key === 'on') {
                  let events = data[key];

                  for (let name in events) {
                    console.log("难道你没有改变吗？？？？？？？？？？？？？？", el);
                    el.addEventListener(name, events[name]);
                  }
                }
              } else if (domPropsRE$1.test(key)) {
                /** Properties(DOM Prop) 和 Attributes
                 * 1. 标准属性，DOM prop 如 id <body id = 'page'></body>
                 * 可以通过 document.body.id来访问，也可以document.body[id] 直接设置
                 * 2. 非标属性，Attributes <body custom="val">
                 *  当尝试通过document.body.custom 访问不了
                */
                // 当作DOM Prop处理
                console.log("DOM Prop:::::::::::::::::", key);
                el[key] = nextVNode;
              } else {
                // 当作Attr处理
                if (key === 'domProps') {
                  let item = data[key];
                  console.log(" 瞧一瞧", item);

                  for (let it in item) {
                    el[it] = item[it];
                  }
                }

                console.log("    Attr ::::::::::: ", key); // el.setAttribute(key,data[key])                
              }

              break;
          }
        }
      } // 递归地挂载子节点


      const childFlags = vnode.childFlags;
      const children = vnode.children;

      if (childFlags !== ChildrenFlags.NO_CHILDREN) {
        if (childFlags & ChildrenFlags.SINGLE_VNODE) {
          // 单个子节点，直接mout
          mount$1(children, el);
        } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
          for (let i = 0; i < vnode.children.length; i++) {
            mount$1(children[i], el);
          }
        }
      }

      console.log("=====你在这里调用了？？？？？=====", container);
      refVNode ? container.insertBefore(el, refVNode) : container.appendChild(el);
    }

    function mountText(vnode, container) {
      const el = document.createTextNode(vnode.children);
      vnode.el = el;
      container.appendChild(el);
    }

    function infernoDiff(prevChildren, nextChildren, container) {
      let j = 0;
      let prevEnd;
      let nextEnd;
      console.log("庙里个喵喵*********-----", prevChildren.length);
      console.log("啷里格-----", prevChildren);

      outer: {
        while (j < prevChildren.length && j < nextChildren.length) {
          if (prevChildren[j].key == nextChildren[j].key) {
            patch(prevChildren[j], nextChildren[j], container);
            j++;
          } else {
            break;
          }

          if (j >= nextChildren.length || j >= prevChildren.length) {
            break outer;
          }
        }

        prevEnd = prevChildren.length - 1;
        nextEnd = nextChildren.length - 1;

        while (prevEnd > 0 && nextEnd > 0) {
          if (prevChildren[prevEnd].key == nextChildren[nextEnd].key) {
            patch(prevChildren[prevEnd], nextChildren[nextEnd], container);
            prevEnd--;
            nextEnd--;
          } else {
            break;
          }

          if (j >= nextChildren.length || j >= prevChildren.length) {
            break outer;
          }
        }
      }

      if (j > prevEnd && j <= nextEnd) {
        // 旧节点先遍历完，新节点还有剩余,需挂载剩余的新节点
        for (let i = j; i <= nextEnd; i++) {
          mount(nextChildren[i], container, nextChildren[prevEnd + 1].el);
        }
      } else if (j > nextEnd) {
        // 新节点先遍历完，需删除多余的旧节点
        for (let i = j; i <= prevEnd; i++) {
          container.removeChild(prevChildren[i].el);
        }
      } else {
        let source = []; // 新旧节点都没遍历完。需要移动节点

        for (let i = j; i <= nextEnd - j + 1; i++) {
          source.push(-1);
        }

        let prevStart = j;
        let nextStart = j;
        let moved = false;
        let pos = 0;
        let patched = 0; // 构建索引表

        const keyIndex = {};

        for (let i = nextStart; i <= nextEnd; i++) {
          keyIndex[nextChildren[i].key] = i;
        } //遍历旧children的剩余未处理节点


        let prevVnode;

        for (let i = prevStart; i <= prevEnd; i++) {
          prevVnode = prevChildren[i];

          if (patched < nextEnd - j + 1) {
            //已经更新的节点数 小于 新节点剩余数目
            const k = keyIndex[prevVnode.key];

            if (k != undefined) {
              patch(prevVnode, nextChildren[k], container);
              patched++;
              source[k - nextStart] = i;

              if (k < pos) {
                // 移动
                moved = true;
              } else {
                pos = k;
              }
            } else {
              // 不存在
              container.removeChild(prevVnode.el);
            }
          } else {
            // patched == nextEnd -j + 1 旧节点剩余的应该移除
            container.removeChild(prevVnode.el);
          }
        }

        if (moved) {
          const seq = lis(source); // j指向最长递增子序列的最后一个值

          let j = seq.length - 1; // 遍历source 判断哪些节点需要移动

          for (let i = source.length - 1; i >= 0; i--) {
            if (source[i] == -1) {
              // 新节点，需要挂载
              let pos = i + nextStart;
              let nextPos = pos + 1;
              mount(nextChildren[pos], container, nextPos < nextChildren.length ? nextChildren[nextPos].el : null);
            } else {
              //在旧节点中存在，
              // 通过lis 尽可能减少移动
              if (seq[j] === i) {
                // 不需要移动
                j--;
              } else {
                // seq[j]!== i  需要移动，该怎么移动？
                // 这里处理的是剩余的新节点，并且真实的dom最后应该是按新节点顺序挂载
                let pos = i + nextStart;
                let nextPos = pos + 1;
                container.insertBefore(nextChildren[pos], nextPos < nextChildren.length ? nextChildren[nextPos] : null);
              }
            }
          }
        }
      }
    } // 最长递增子序列

    function lis(source) {
      const lisArr = new Array(source.length).fill(1); // [0,8,4,12,2,10]

      for (let i = source.length - 2; i >= 0; i--) {
        let max = 1;

        for (let j = i + 1; j < source.length; j++) {
          if (source[i] < source[j]) {
            let tmp = lisArr[i] + lisArr[j];

            if (tmp > max) {
              max = tmp;
            }
          }
        }

        if (max > lisArr[i]) {
          lisArr[i] = max;
        }
      }

      let seq = [];
      let maxValue = Math.max.apply(null, lisArr);

      while (maxValue >= 1) {
        let idx = lisArr.findIndex(item => item == maxValue);
        seq.push(idx);
        maxValue--;
      }

      return seq;
    }

    const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;
    function patch(prevVNode, nextVNode, container) {
      console.log("MMMMMMMMMMMMMMMMMMMMMMMMM", container);
      console.log("你到底更新不？？");
      const nextFlags = nextVNode.flags;
      const prevFlags = prevVNode.flags;
      console.log("哪里走》》", prevFlags);
      console.log("哪里走》》", nextFlags); // 新旧节点是同一种类型才进行比较，不是同一种类型直接替换

      if (prevFlags !== nextFlags) {
        console.log(1111111);
        replaceVNode(prevVNode, nextVNode, container);
      } else if (nextFlags && VNodeFlags.ELEMENT) {
        console.log(222222);
        patchElement(prevVNode, nextVNode, container);
      } else if (nextFlags & VNodeFlags.COMPONENT) {
        console.log(3333333333);
        patchComponent(prevVNode, nextVNode, container);
      } else if (nextFlags & VNodeFlags.TEXT) {
        console.log(444444444);
        patchText(prevVNode, nextVNode);
      } else if (nextFlags & VNodeFlags.FRAGMENT) {
        console.log(555555);
        patchFragment(prevVNode, nextVNode, container);
      } else if (nextFlags & VNodeFlags.PORTAL) {
        console.log(66);
        patchPortal(prevVNode, nextVNode);
      }

      console.log("哪里走》》");
    }

    function replaceVNode(prevVNode, nextVNode, container) {
      container.removeChild(prevVNode.el);
      mount(nextVNode, container);
    }
    /**
     * patch 文本节点
    */


    function patchText(prevVNode, nextVNode) {
      const el = nextVNode.el = prevVNode.el;

      if (prevVNode.children !== nextVNode.children) {
        el.nodeValue = nextVNode.children;
      }
    }
    /**
     * patch 元素节点
    */


    function patchElement(prevVNode, nextVNode, container) {
      // 如果新旧VNode描述的是不同标签，调用replaceVNode，新节点替换旧节点
      console.log("新旧；；；", prevVNode, nextVNode);

      if (prevVNode.tag !== nextVNode.tag) {
        replaceVNode(prevVNode, nextVNode, container);
        return;
      }

      const el = nextVNode.el = prevVNode.el;
      const prevData = prevVNode.data;
      const nextData = nextVNode.data; // if(prevData == null && nextData == null  ){
      //     console.log("气死");
      //     return
      // }

      console.log("秒~~~啊~~~~·", nextData); // 新的VNodeData存在时才有必要更新

      if (nextData) {
        for (let key in nextData) {
          const prevValue = prevData[key];
          const nextValue = nextData[key];
          patchData(el, key, prevValue, nextValue);
        }
      } else {
        //  没有VNodeData 说明旧的prevNodeData需要移除
        if (prevData) {
          for (let key in prevVNode) {
            const prevValue = prevData[key];
            patchData(el, key, prevValue, null);
          }
        }
      } // 先看看子节点是傻子？


      if (typeof prevVNode.children == 'string' && typeof nextVNode.children == 'string') {
        // 子节点都是文本~！！
        patchText(prevVNode, nextVNode);
        return;
      } // 调用patchChildren 函数递归地更新子节点


      patchChildren(prevVNode.childFlags, // 旧的VNode 子节点的类型
      nextVNode.childFlags, // 新的VNode子节点的类型
      prevVNode.children, // 旧的VNode子接待你
      nextVNode.children, el);
    }

    function patchData(el, key, prevValue, nextValue) {
      switch (key) {
        case 'style':
          // 遍历新VNodeData中的style数据，将新的样式应用到元素
          for (let k in nextValue) {
            el.style[k] = nextValue[k];
          } // 遍历旧prevValue中的style数据，将旧的样式中不存在于新样式的剔除


          for (let k in prevValue) {
            if (nextValue == undefined) {
              el.style[k] = '';
            } else {
              if (prevValue && !nextValue.hasOwnProperty(k)) {
                el.style[k] = '';
              }
            }
          }

          break;

        case 'class':
          el.className = nextValue;
          break;

        default:
          if (key[0] === 'o' && key[1] == 'n') {
            el.addEventListener(key.slice(2), nextValue);
          } else if (domPropsRE.test(key)) {
            /** Properties(DOM Prop) 和 Attributes
             * 1. 标准属性，DOM prop 如 id <body id = 'page'></body>
             * 可以通过 document.body.id来访问，也可以document.body[id] 直接设置
             * 2. 非标属性，Attributes <body custom="val">
             *  当尝试通过document.body.custom 访问不了
            */
            // 当作DOM Prop处理                                
            el[key] = nextVNode;
          } else {
            // 当作Attr处理
            el.setAttribute(key, nextValue);
          }

          break;
      }
    }
    function patchChildren(prevChildFlags, nextChildFlags, prevChildren, nextChildren, container) {
      console.log("prevChildFlags", prevChildFlags);
      console.log("nextChildFlags", nextChildFlags);

      switch (prevChildFlags) {
        // 旧的children是单个子节点，会执行该case语句块
        case ChildrenFlags.SINGLE_VNODE:
          console.log('旧的children是单个子节点，会执行该case语句块');

          switch (nextChildFlags) {
            // 新的children也是单个子节点
            case ChildrenFlags.SINGLE_VNODE:
              // 此时prevChildren 和 nextChildren 都是VNode对象
              patch(prevChildren, nextChildren, container);
              break;
            // 新的children没有子节点

            case ChildrenFlags.NO_CHILDREN:
              console.log(77777777);
              container.removeChild(prevChildren.el);
              break;
            // 新的children有多个子节点                
            // default:                
            //     replaceVNode(prevChildren,nextChildren,container)
            //     break             
            // 新的children有多个子节点

            default:
              // 移除旧的单个字节点
              console.log(888888);
              container.removeChild(prevChildren.el); // 将新的多个子节点一一挂载到容器中

              for (let i = 0; i < nextChildren.length; i++) {
                mount(nextChildren[i], container);
              }

              break;
          }

          break;
        // 旧的children没有子节点

        case ChildrenFlags.NO_CHILDREN:
          console.log('旧的children没有子节点');

          switch (nextChildFlags) {
            // 新的children 有一个子节点
            case ChildrenFlags.SINGLE_VNODE:
              mount(nextChildren, container);
              break;
            // 新的children也没有子节点，新旧都没有，啥也不用做    

            case ChildrenFlags.NO_CHILDREN:
              break;

            default:
              for (let i = 0; i < nextChildren.length; i++) {
                mount(nextChildren[i], container);
              }

              break;
          }

          break;
        // 旧的children是多个子节点

        default:
          console.log('旧的children是多个子节点0');

          switch (nextChildFlags) {
            // 新的是单个子节点
            case ChildrenFlags.SINGLE_VNODE:
              for (let i = 0; i < prevChildren.length; container) {
                container.removeChild(prevChildren[i].el);
              }

              mount(nextChildren, container);

            case ChildrenFlags.NO_CHILDREN:
              for (let i = 0; i < prevChildren.length; container) {
                container.removeChild(prevChildren[i].el);
              }

              break;

            default:
              // 新的children是多个子节点，使用diff算法
              // waiting to do         
              // compareDoubleEnd(prevChildren,nextChildren,container)
              infernoDiff(prevChildren, nextChildren, container);
              break;
          }

          break;
      }
    }

    function initRender(vm) {
      vm._vnode = null;
      vm._staticTrees = null; //vm._c 是用于编译器根据模板字符串生渲染函数的
      // vm._c = (a,b,c,d) => createElement(vm,a,b,c,d,false)
      // vm.$createElement = (a,b,c,d) => createElement(vm,a,b,c,d,true)

      XVue.prototype._update = function (vnode, hy) {
        const vm = this;
        let container = vm.$el;
        const prevVNode = vm._vnode;
        const parent = vm.$parent;
        let parentElm = null;
        console.log("————————————————————————————————————要重新更新吗？", prevVNode);

        if (prevVNode == null) {
          // 没有旧的VNode， 使用"mounnt"函数挂在全新的VNode
          if (!parent) {
            // 没有parent，是根节点渲染
            parentElm = container.parentNode;
            parentElm && parentElm.removeChild(container);
            container = parentElm;
          } else {
            container = parent;
          }

          if (vnode) {
            mount$1(vnode, container);
            vm._vnode = vnode;
            vm.$el = vnode.el; // container.vnode = vnode
          }
        } else {
          if (vnode) {
            //有旧的VNode, 则调用'patch'函数打补丁
            console.log("打补吗？？？？？？？？！！！！！！！！！！！！！！", patch);
            patch(prevVNode, vnode, container); // container.vnode = vnode

            vm._vnode = vnode;
            vm.$el = vnode.el;
          } else {
            // 有旧的vnode，但是没有新的vnode，直接移除旧的
            container.removeChild(prevVNode.el); // container.vnode = null

            vm._vnode = null;
          }
        }
      };

      XVue.prototype._render = function () {
        const vm = this;
        const {
          render
        } = vm.$options;
        let vnode;

        try {
          vnode = render.call(vm);
        } catch (e) {
          warn$2(`Render Error:${e}`);
        }

        return vnode;
      }; // 组装渲染函数方法


      installRenderHelpers(XVue.prototype);
    }
    function mount$1(vnode, container, refVNode) {
      const flags = vnode.flags;

      if (flags & VNodeFlags.ELEMENT) {
        // 挂载普通标签        
        mountElement(vnode, container, refVNode);
      } else if (flags & VNodeFlags.COMPONENT) ; else if (flags & VNodeFlags.FRAGMENT) ; else if (flags & VNodeFlags.TEXT) {
        // 挂载纯文本
        mountText(vnode, container);
      }
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

        if (Array.isArray(value)) {
          const augment = protoAugment;
          augment(value, arrayMethods, arrayKeys); // 使嵌套的数据也是响应式的

          this.observeArray(value);
        } else {
          this.walk(value);
        }
      }
      /**
       * 遍历obj, 给每个属性都设置响应式
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
          console.error('[XVue: ] Observer error');
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
            console.log("____get ???????????", value);
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

    /**
     * baseCompile，基础编译器，我们为了特定平台设计的编译器
     * baseCompile 输入template, 输出{ast, render}
     *  */
    function createCompilerCreator(baseCompile) {
      return function createCompier(baseOptions) {
        function compile(template, options) {
          const finalOptions = Object.create(baseOptions);

          let warn = (msg, range, tip) => {
          };

          if (options) {
            // merge custom moudles
            if (options.modules) {
              finalOptions.modules = (baseOptions.modules || []).concat(options.modules);
            } //copy other options


            for (const key in options) {
              if (key !== 'modules' && key !== 'directives') {
                finalOptions[key] = options[key];
              }
            }
          }

          finalOptions.warn = warn;
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
    /**
     * compile 就是注入了finalOptions参数的 baseCompile 
     *  本质还是 baseCompile 编译器
    */

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

        res.render = compiled.render;
        return cache[key] = res;
      };
    }

    const validDivisionCharRE$1 = /[\w).+\-_$\]]/;
    /**
     * \w 匹配非特殊字符，即a-z, A-Z, 0-9, _, 汉字
     * \W 匹配特殊字符, 即非\w的其余的所有特殊字符 
     * 
     * validDivisionCharRE用来匹配一个字符
     */

    function parseFilters$1(exp) {
      let inSingle = false;
      let inDouble = false;
      let inTemplateString = false;
      let inRegex = false;
      let curly = 0;
      let square = 0;
      let paren = 0;
      let lastFilterIndex = 0;
      let c, prev, i, expression, filters;

      for (i = 0; i < exp.length; i++) {
        prev = c; // charCodeAt()返回指定位置的字符的ASCII码

        c = exp.charCodeAt(i);

        if (inSingle) {
          if (c === 0x27 && prev !== 0x5C) inSingle = false;
        } else if (inDouble) {
          if (c === 0x22 && prev !== 0x5C) inDouble = false;
        } else if (inTemplateString) {
          if (c === 0x60 && prev !== 0x5C) inTemplateString = false;
        } else if (inRegex) {
          //当前读取的字符存在于正则表达式内，已确定为正则环境
          if (c === 0x2f && prev !== 0x5C) inRegex = false;
        } else if (c === 0x7C && //pipe |
        exp.charCodeAt(i + 1) !== 0x7C && exp.charCodeAt(i - 1) !== 0x7C && !curly && !square && !paren) {
          if (expression === undefined) {
            // i是当前遇到的管道符|的位置索引，
            lastFilterIndex = i + 1;
            expression = exp.slice(0, i).trim();
          } else {
            pushFilter();
          }
        } else {
          switch (c) {
            case 0x22:
              inDouble = true;
              break;
            // " 

            case 0x27:
              inSingle = true;
              break;
            // ' 单引

            case 0x60:
              inTemplateString = true;
              break;
            // ` 模板字符串的单引  `${{msg}}`

            case 0x28:
              paren++;
              break;
            // ( 开括号

            case 0x29:
              paren--;
              break;
            // ) 闭括号

            case 0x5B:
              square++;
              break;
            // [ 开方括号

            case 0x5D:
              square--;
              break;
            // ]

            case 0x7B:
              curly++;
              break;
            // {

            case 0x7D:
              curly--;
              break;
            // }
          }

          if (c === 0x2f) {
            // / 进入正则环境的代码
            let j = i - 1;
            let p;

            for (; j >= 0; j--) {
              //charAt()返回指定位置的字符串
              p = exp.charAt(j);
              if (p !== ' ') break; //如果找到了 /字符之前不为空的字符 则break结束for循环
            }
            /**
             * p不存在，或者字符串不满足正则validDivisionCharRE的情况下
             * （/前面的字符不能是validDivisionCharRE所匹配的任何一个字符，否则/不会被认为是正则的开始）
             * 认为 / 是正则的开始
            */


            if (!p || !validDivisionCharRE$1.test(p)) {
              inRegex = true;
            }
          }
        }
      }

      if (expression === undefined) {
        expression = exp.slice(0, i).trim();
      } else if (lastFilterIndex !== 0) {
        pushFilter();
      }

      function pushFilter() {
        //lastFilterIndex = i+1 是管道符|的后一个字符的位置
        (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
        lastFilterIndex = i + 1;
      }

      if (filters) {
        for (i = 0; i < filters.length; i++) {
          expression = wrapFilter$1(expression, filters);
        }
      }

      return expression;
    }

    function wrapFilter$1(exp, filter) {
      const i = filter.indexOf('(');

      if (i < 0) {
        return `_f("${filter}")(${exp})`;
      } else {
        const name = filter.slice(0, i);
        const args = filter.slice(i + 1);
        return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args})`;
      }
    }

    function getAndRemoveAttr(el, name, removeFromMap) {
      let val;
      /**
       * 
       * undefined == null 为true          
       */
      // console.log("查看 v-else",name);
      // console.log("妈咪妈咪轰",el.attrsMap[name]);

      if ((val = el.attrsMap[name]) != null) {
        // console.log("jejejda =======",val);
        const list = el.attrsList;

        for (let i = 0, l = list.length; i < l; i++) {
          if (list[i].name === name) {
            /**
             * splice()从数组中 添加/删除 项目，然后返回被删除的项目。改变原数组
             */
            list.splice(i, 1);
            break;
          }
        }
      }

      if (removeFromMap) {
        delete el.attrsMap[name];
      }
      /**返回该属性name 对应的 value */


      return val;
    }
    function getBindingAttr(el, name, getStatic) {
      // console.log("平平无奇仙女生日---",el,name);
      const dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name); // console.log("&这到底有啥区别呢/。?&",dynamicValue);

      if (dynamicValue != null) {
        // :key 或者v-bind:key 存在    
        return parseFilters$1(dynamicValue);
      } else if (getStatic !== false) {
        //进入此说明绑定属性值失败 el上不存在key属性值
        // :key 或者v-bind不存在时 dynamicValue 是undefined，进入这里
        //当第三个参数不传递时, 默认该elseif存在
        const staticValue = getAndRemoveAttr(el, name); // console.log("&这到底有啥区别呢/。?&---staticValue-----",staticValue);

        if (staticValue != null) {
          //返回 非绑定属性值请用JSON.stringigy
          return JSON.stringify(staticValue);
        }
      }
    }

    function transformNode$1(el, options) {
      const staticClass = getAndRemoveAttr(el, 'class');

      if (staticClass) {
        el.staticClass = JSON.stringify(staticClass);
      }

      const classBinding = getBindingAttr(el, 'class', false);

      if (classBinding) {
        el.classBinding = classBinding;
      }
    }

    var klass = {
      staticKeys: ['staticClass'],
      transformNode: transformNode$1
    };

    function transformNode(el, options) {
      const staticStyle = getAndRemoveAttr(el, 'style');

      if (staticStyle) {
        el.staticKeys = JSON.stringify(style$1.parseStyleText(staticStyle));
      }

      const styleBinding = getBindingAttr(el, 'style', false
      /* getStatic */
      );

      if (styleBinding) {
        el.styleBinding = styleBinding;
      }
    }

    var style = {
      staticKeys: ['staticStyle'],
      transformNode
    };

    const validDivisionCharRE = /[\w).+\-_$\]]/;
    /**
     * \w 匹配非特殊字符，即a-z, A-Z, 0-9, _, 汉字
     * \W 匹配特殊字符, 即非\w的其余的所有特殊字符 
     * 
     * validDivisionCharRE用来匹配一个字符
     */

    function parseFilters(exp) {
      let inSingle = false;
      let inDouble = false;
      let inTemplateString = false;
      let inRegex = false;
      let curly = 0;
      let square = 0;
      let paren = 0;
      let lastFilterIndex = 0;
      let c, prev, i, expression, filters;

      for (i = 0; i < exp.length; i++) {
        prev = c; // charCodeAt()返回指定位置的字符的ASCII码

        c = exp.charCodeAt(i);

        if (inSingle) {
          if (c === 0x27 && prev !== 0x5C) inSingle = false;
        } else if (inDouble) {
          if (c === 0x22 && prev !== 0x5C) inDouble = false;
        } else if (inTemplateString) {
          if (c === 0x60 && prev !== 0x5C) inTemplateString = false;
        } else if (inRegex) {
          //当前读取的字符存在于正则表达式内，已确定为正则环境
          if (c === 0x2f && prev !== 0x5C) inRegex = false;
        } else if (c === 0x7C && //pipe |
        exp.charCodeAt(i + 1) !== 0x7C && exp.charCodeAt(i - 1) !== 0x7C && !curly && !square && !paren) {
          if (expression === undefined) {
            // i是当前遇到的管道符|的位置索引，
            lastFilterIndex = i + 1;
            expression = exp.slice(0, i).trim();
          } else {
            pushFilter();
          }
        } else {
          switch (c) {
            case 0x22:
              inDouble = true;
              break;
            // " 

            case 0x27:
              inSingle = true;
              break;
            // ' 单引

            case 0x60:
              inTemplateString = true;
              break;
            // ` 模板字符串的单引  `${{msg}}`

            case 0x28:
              paren++;
              break;
            // ( 开括号

            case 0x29:
              paren--;
              break;
            // ) 闭括号

            case 0x5B:
              square++;
              break;
            // [ 开方括号

            case 0x5D:
              square--;
              break;
            // ]

            case 0x7B:
              curly++;
              break;
            // {

            case 0x7D:
              curly--;
              break;
            // }
          }

          if (c === 0x2f) {
            // / 进入正则环境的代码
            let j = i - 1;
            let p;

            for (; j >= 0; j--) {
              //charAt()返回指定位置的字符串
              p = exp.charAt(j);
              if (p !== ' ') break; //如果找到了 /字符之前不为空的字符 则break结束for循环
            }
            /**
             * p不存在，或者字符串不满足正则validDivisionCharRE的情况下
             * （/前面的字符不能是validDivisionCharRE所匹配的任何一个字符，否则/不会被认为是正则的开始）
             * 认为 / 是正则的开始
            */


            if (!p || !validDivisionCharRE.test(p)) {
              inRegex = true;
            }
          }
        }
      }

      if (expression === undefined) {
        expression = exp.slice(0, i).trim();
      } else if (lastFilterIndex !== 0) {
        pushFilter();
      }

      function pushFilter() {
        //lastFilterIndex = i+1 是管道符|的后一个字符的位置
        (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
        lastFilterIndex = i + 1;
      }

      if (filters) {
        for (i = 0; i < filters.length; i++) {
          expression = wrapFilter(expression, filters);
        }
      }

      return expression;
    }

    function wrapFilter(exp, filter) {
      const i = filter.indexOf('(');

      if (i < 0) {
        return `_f("${filter}")(${exp})`;
      } else {
        const name = filter.slice(0, i);
        const args = filter.slice(i + 1);
        return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args})`;
      }
    }

    function addHandler(el, name, value, modifiers, important, warn, range, dynamic) {
      modifiers = modifiers || emptyObject;
      modifiers = modifiers || emptyObject;

      if (modifiers.capture) {
        delete modifiers.capture;
        name = '!' + name;
      }

      if (modifiers.once) {
        delete modifiers.once;
        name = '~' + name;
      }

      if (modifiers.passive) {
        delete modifiers.passive;
        name = '&' + name;
      }

      if (name === 'click') {
        if (modifiers.right) {
          // right修饰符标识右击
          name = 'contextmenu'; // 右击会触发contextmenu事件 弹出一个菜单

          delete modifiers.right;
        } else if (modifiers.middle) {
          // middle 滚轮事件
          name = 'mouseup';
        }
      }

      let events;

      if (modifiers.native) {
        delete modifiers.native;
        events = el.nativeEvents || (el.nativeEvents = {});
      } else {
        events = el.events || (el.events = {});
      }

      const newHandler = {
        value
      };

      if (modifiers !== emptyObject) {
        newHandler.modifiers = modifiers;
      }

      const handlers = events[name];

      if (Array.isArray(handlers)) ; else if (handlers) ; else {
        events[name] = newHandler;
      }
    }
    function pluckModuleFunction(modules, key) {
      return modules ? modules.map(m => m[key]).filter(_ => _) : [];
    }
    function baseWarn$1(msg, rang) {
      console.error(`[Vue compiler]: ${msg}`);
    }
    function addDirective(el, name, rawName, value, arg, modifiers) {
      console.log("el.directives.........指令---", el);
      (el.directives || (el.directives = [])).push({
        name,
        rawName,
        value,
        arg,
        modifiers
      });
      el.plain = false;
    }
    function addProp(el, name, value, range, dynamic) {
      (el.props || (el.props = [])).push({
        name,
        value,
        dynamic
      });
      el.plain = false;
    }

    function model$1(el, dir, _warn) {
      const value = dir.value;
      const tag = el.tag;
      const type = el.attrsMap.type;

      if (el.component) {
        genComponentModel(el, value);
      } else if (tag === 'select') ; else if (tag === 'input' && type === 'checkbox') ; else if (tag === 'input' && type == 'radio') ; else if (tag === 'input' || tag === 'textarea') {
        genDefaultModel$1(el, value);
      } else if (!isHTMLTag(tag)) {
        return false;
      } else {
        warn(`<${el.tag} m-model="${value}">: ` + `m-model is not supported on this element type. `);
      }

      return true;
    }
    /**
     * 对input输入框 textarea处理
     */

    function genDefaultModel$1(el, value) {
      const type = el.attrsMap.type;
      {
        const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];

        if (value) {
          const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
          warn(`${binding}="${value}" conflicts with v-model on the same element `);
        }
      }
      const needComposiion = type !== 'range';
      const event = type === 'range' ? '__r' : 'input';
      let valueExpression = `$event.target.value`;
      let code = genAssignmentCode$1(value, valueExpression);
      console.log("+=====!!!!!!!!!!!!!!!!!!!!!!!!!==", code);

      if (needComposiion) {
        code = `if($event.target.composingTT)return;${code}`;
      }

      addProp(el, 'value', `(${value})`);
      addHandler(el, event, code, null);
    }

    function genAssignmentCode$1(value, assignment) {
      const res = parseModel$1(value);

      if (res.key === null) {
        return `${value} =${assignment};`;
      } else {
        return `$set(${res.exp},${res.key},${assignment})`;
      }
    } // 处理m-model="obj.val"
    // 暂不处理带[]的


    function parseModel$1(val) {
      val = val.trim();
      let len = val.length; // 1. m-model = "name"
      // 2. m-model = "obj[name].age"
      // 3. m-model = "obj.name.age"

      if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
        let index = val.lastIndexOf('.');

        if (index > -1) {
          return {
            exp: val.slice(0, index),
            key: JSON.stringify(val.slice(index + 1))
          };
        } else {
          return {
            exp: val,
            key: null
          };
        }
      }
    }

    var modules = [klass, style, model$1]; // export default{
    //       klass,
    //   style,
    //   model
    // }

    /* @flow */
    const isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr'); // Elements that you can, intentionally, leave open
    // (and which close themselves)

    const canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'); // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
    // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content

    makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' + 'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' + 'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' + 'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' + 'title,tr,track');
    const baseOptions = {
      expectHTML: true,
      modules,
      isUnaryTag,
      canBeLeftOpenTag
    };

    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
    // but for Vue templates we can enforce a simple charset

    const ncname = '[a-zA-Z_][\\w\\-\\.]*';
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
    const startTagOpen = new RegExp(`^<${qnameCapture}`);
    const startTagClose = /^\s*(\/?)>/;
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

    const comment = /^<!\--/;
    const isPlainTextElement = makeMap('script,style,textarea', true);
    function parseHTML(html, options) {
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
              continue;
            } // 结束标签


            const endTagMatch = html.match(endTag);

            if (endTagMatch) {
              const curIndex = index;
              advance(endTagMatch[0].length);
              parseEndTag(endTagMatch[1], curIndex, index);
              continue;
            }
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
          advance(start[0].length); // 截取<div

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
            lowerCasedTag: tagName.toLowerCase(),
            attrs: attrs
          });
          lastTag = tagName;
        }

        if (options.start) {
          options.start(tagName, attrs, unary, match.start, match.end);
        }
      } // 解析结束标签


      function parseEndTag(tagName, start, end) {
        let pos, lowerCasedTagName;
        if (start == null) start = index;
        if (end == null) end = index;

        if (tagName) {
          lowerCasedTagName = tagName.toLowerCase();
        } //寻找当前解析的结束标签所对应的开始标签在stack栈中的位置


        if (tagName) {
          for (pos = stack.length - 1; pos > 0; pos--) {
            if (stack[pos].lowerCasedTag == lowerCasedTagName) {
              break;
            }
          }
        } else {
          pos = 0;
        }

        if (pos >= 0) {
          for (let i = stack.length - 1; i >= pos; i--) {
            if (i > pos) {
              options.warn(`tag < ${stack[i].tag} > has no matching end tag.`);
            }

            if (options.end) {
              // options.end(stack[i].tag,start,end)
              options.end();
            }
          }

          stack.length = pos;
          lastTag = pos && stack[pos - 1].tag;
        } else if (lowerCasedTagName == 'br') {
          if (options.start) {
            options.start(tagName, [], false, start, end);
          }
        } else if (lowerCasedTagName === 'p') {
          if (options.start) {
            options.start(tagName, [], false, start, end);
          }

          if (options.end) {
            // options.end(tagName,start,end)
            options.end();
          }
        }
      }
    }

    const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
    const buildRegex = cached(delimiters => {
      delimiters[0].replace(regexEscapeRE, '\\$&');
    });
    function parseText(text, delimiters) {
      const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;

      if (!tagRE.test(text)) {
        return;
      }

      const tokens = [];
      const rawTokens = [];
      let lastIndex = tagRE.lastIndex = 0;
      let match, index, tokenValue;
      /**
       *  eg: text = '我的名字{{name}},请多多指教'
      */

      while (match = tagRE.exec(text)) {
        // match = ["{{name}}", "name",index:4,input: '我的名字{{name}},我的年龄{{age}}']
        // 初始时 lastIndex 被设置为了0
        // match.index 匹配文本的第一个字符串的位置
        // 匹配一次成功后, RegExpObject的lastIndex会被设置到匹配文本的最后一个字符的下一个位置
        index = match.index;

        if (index > lastIndex) {
          // lastIndex 本次开始字符串开始的位置 （上一次匹配文本的最后一个字符的下一个位置）
          // index 是本轮已匹配成功的文本的第一个字符的位置
          // text.slice(lastIndex,index) 是纯文本
          rawTokens.push(tokenValue = text.slice(lastIndex, index));
          tokens.push(JSON.stringify(tokenValue));
        }

        const exp = parseFilters(match[1].trim());
        tokens.push(`_s(${exp})`);
        rawTokens.push({
          '@binding': exp
        });
        lastIndex = index + match[0].length;
      } //text = '我的名字{{name}},请多多指教'
      // tagRE每次执行exec时，都会从tagRE.lastIndex位置开始陪陪，当tagRE.lastIndex指向“,”
      // match返回null 跳出while循环。 但此时lastIndex= 12  text.length = 18


      if (lastIndex < text.length) {
        // 处理最后剩余的纯文本
        rawTokens.push(tokenValue = text.slice(lastIndex));
        tokens.push(JSON.stringify(tokenValue));
      }

      return {
        expression: tokens.join('+'),
        tokens: rawTokens
      };
    }

    const dirRE = /^v-|^@|^:/; // const modifierRE = /\.[^.]+/g

    const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;
    const bindRE = /^:|^v-bind:/;
    const argRE = /:(.*)$/;
    function processAttrs(el) {
      const list = el.attrsList;
      let i, l, name, rawName, value, modifiers;

      for (i = 0, l = list.length; i < l; i++) {
        name = rawName = list[i].name;
        value = list[i].value;

        if (dirRE.test(name)) {
          //匹配是否有指令 v- 开头 @即 v-on     : 即 v-bind      const dirRE = /^v-|^@|^:/  
          // mark element as dynamic 
          el.hasBindings = true; // modifiers 修饰符

          modifiers = parseModifiers(name);

          if (modifiers) {
            name = name.replace(modifierRE, '');
          }

          if (bindRE.test(name)) {
            // v-bind     bindRE = /^:|^v-bind:/
            name = name.replace(bindRE, ''); // eg  v-bind:some-prop.sync 先用''替换掉修饰符，再替换掉v-bind
            // parseFilter用来将表达式和过滤器整合在一起

            value = parseFilters(value); // isProp标识着该绑定属性是否是原生DOM对象  eg  innherHtml 通过 .访问
            // to do...
            // if ((modifiers && modifiers.prop) || (
            //     !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
            //   )) {
            //     addProp(el, name, value, list[i], isDynamic)
            //   } else {
            //     addAttr(el, name, value, list[i], isDynamic)
            //   }
          } else if (onRE.test(name)) {
            // v-on
            name = name.replace(onRE, '');
            addHandler(el, name, value, modifiers, false, warn);
          } else {
            // normal directives  v-model 也在此间
            name = name.replace(dirRE, ''); // parse arg 

            const argMatch = name.match(argRE);
            const arg = argMatch && argMatch[1];

            if (arg) {
              name = name.slice(0, -(arg.length + 1));
            }

            addDirective(el, name, rawName, value, arg, modifiers); // if(name === 'model'){
            //     checkForAliasModel(el, value)
            // }                
          }
        }
      }
    }

    function parseModifiers(name) {
      const match = name.match(modifierRE);

      if (match) {
        const ret = {};
        match.forEach(m => {
          ret[m.slice(1)] = true;
        });
        return ret;
      }
    }

    const onRE = /^@|^v-on:/;

    function makeAttrsMap(attrs) {
      const map = {};
      let l = attrs.length;

      for (let i = 0; i < l; i++) {
        map[attrs[i].name] = attrs[i].value;
      }

      return map;
    }

    function processElement(element, options) {
      processAttrs(element);
    }
    function createASTElement(tag, attrs, parent) {
      let ele = {
        type: 1,
        tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent,
        children: []
      };
      return ele;
    }
    let warned = false;

    function warnOnce(msg) {
      if (!warned) {
        warned = true;
        warn$1(msg);
      }
    }

    let warn$1, preTransforms; // parse在词法分析的基础上做句法分析

    function parse(template, options) {
      let root = null;
      let stack = [];
      let currentParent;
      warn$1 = options.warn || baseWarn$1;
      preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
      pluckModuleFunction(options.modules, 'transformNode');

      function closeElement(element) {
        if (!stack.length && element != root) {
          // stack 为空，且element不是根元素

          /**
           *  <div v-if = "xx"> </div>
           *  <div v-else> </div>
           */
          if (root.if && (element.elseif || element.else)) {
            checkRootConstraints(element);
          }

          addIfCondition(root, {
            exp: element.elseif,
            block: element
          });
        } else {
          warnOnce(`Component template should contain exactly one root element. ` + `If you are using v-if on multiple elements, ` + `use v-else-if to chain them instead.`, {
            start: element.start
          });
        }
      }

      function checkRootConstraints(el) {
        if (el.tag === "slot" || el.tag === "template") {
          warnOnce(`Cannot user <${el.tag}> as component root element becasue it may contain multiple nodes`);
        }

        if (el.attrsMap.hasOwnProperty('v-for')) {
          warnOnce(`Cannot use v-for on stateful component root element because it renders multiple elements. `);
        }
      } // 词法分析


      parseHTML(template, {
        warn: '',
        expectHTML: options.expectHTML,
        isUnaryTag: options.isUnaryTag,
        canBeLeftOpenTag: options.canBeLeftOpenTag,

        start(tag, attrs, unary, start, end) {
          let element = createASTElement(tag, attrs, parent); // apply pre-transforms

          for (let i = 0; i < preTransforms.length; i++) {
            element = preTransforms[i](element, options) || element;
          }

          if (!element.processed) {
            // 如果存在v-if等，则给element添加if  elseif等属性
            // structural directives
            // processIf(element)
            // processFor(element)
            processElement(element);
          }

          if (!root) {
            root = element;
            checkRootConstraints(root);
          } // currentParent


          if (currentParent) {
            if (element.elseif || element.else) {
              /** 当元素使用了 v-else-if 或 v-else指令时，它们不会作为父级元素节点的
               *  而是会被添加到相符的v-if指令的元素描述对象的ifConditions数组中            
               */
              processIfConditions(element, currentParent);
            } else {
              currentParent.children.push(element);
              element.parent = currentParent;
            }
          }

          if (!unary) {
            // 非一元，unary=false
            stack.push(element);
            currentParent = element;
          } else {
            //一元，直接闭合标签
            closeElement(element);
          }
        },

        end() {
          let element = stack[stack.length - 1];
          stack.length -= 1;
          currentParent = stack[stack.length - 1];
          closeElement(element);
        },

        chars(text, start, end) {
          if (!currentParent) {
            // 说明当前template内不存在根节点，元素节点就是全部内容
            return;
          }

          const children = currentParent.children;
          let res;
          let child;

          if (text) {
            // parseText用来解析文本内容
            // <div> 我的名字是: {{name}} </div> 该text包含 字面量表达式
            if (text != '' && (res = parseText(text))) {
              child = {
                type: 2,
                expression: res.expression,
                tokens: res.tokens,
                text
              };
            } else {
              // 文本是空格节点或者 parseText解析失败即是纯文本
              child = {
                type: 3,
                text
              };
            }

            if (child) {
              children.push(child);
            }
          }
        },

        comment() {
          currentParent.children.push({
            type: 3,
            text,
            isComment: true
          });
        }

      });
      return root;
    }
    function addIfCondition(el, condition) {
      if (!el.ifConditions) {
        el.ifConditions = [];
      }

      el.ifConditions.push(condition);
    }

    const genStaticKeysCached = cached(genStaticKeys);

    function genStaticKeys(keys) {
      return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' + (keys ? ',' + keys : ''));
    } // 对AST优化，进行静态标注
    // 静态节点: 永远不需要变化的DOM就是静态的


    function optimize(root, options) {
      if (!root) return;
      genStaticKeysCached(options.isStaticKey || '');
      options.isReservedTag || no; // markStatic(root) // 标注静态节点
      // markStaticRoots(root,false) // 标注静态根节点    
    }

    function on() {}

    function bind() {}

    function model(el, dir, _warn) {
      const value = dir.value;
      const tag = el.tag;
      const type = el.attrsMap.type;

      if (el.component) {
        genComponentModel(el, value);
      } else if (tag === 'select') ; else if (tag === 'input' && type === 'checkbox') ; else if (tag === 'input' && type == 'radio') ; else if (tag === 'input' || tag === 'textarea') {
        genDefaultModel(el, value);
      } else if (!isHTMLTag(tag)) {
        return false;
      } else {
        warn(`<${el.tag} m-model="${value}">: ` + `m-model is not supported on this element type. `);
      }

      return true;
    }
    /**
     * 对input输入框 textarea处理
     */


    function genDefaultModel(el, value) {
      const type = el.attrsMap.type;
      {
        const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];

        if (value) {
          const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
          warn(`${binding}="${value}" conflicts with v-model on the same element `);
        }
      }
      const needComposiion = type !== 'range';
      const event = type === 'range' ? '__r' : 'input';
      let valueExpression = `$event.target.value`;
      let code = genAssignmentCode(value, valueExpression);

      if (needComposiion) {
        code = `if($event.target.composing)return;${code}`;
      }

      addProp(el, 'value', `(${value})`);
      addHandler(el, event, code, null);
    }

    function genAssignmentCode(value, assignment) {
      const res = parseModel(value);

      if (res.key === null) {
        return `${value}=${assignment}`;
      } else {
        return `$set(${res.exp},${res.key},${assignment})`;
      }
    } // 处理m-model="obj.val"
    // 暂不处理带[]的


    function parseModel(val) {
      val = val.trim();
      let len = val.length; // 1. m-model = "name"
      // 2. m-model = "obj[name].age"
      // 3. m-model = "obj.name.age"

      if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
        let index = val.lastIndexOf('.');

        if (index > -1) {
          return {
            exp: val.slice(0, index),
            key: JSON.stringify(val.slice(index + 1))
          };
        } else {
          return {
            exp: val,
            key: null
          };
        }
      }
    }

    var baseDirectives = {
      on,
      bind,
      model //   cloak: noop

    };

    // export function genHandlers(events,isNative){
    //     const prefix = isNative ? 'nativeOn:' : 'on:'
    //     let staticHandlers = ``
    //     let dynamicHandlers = ``
    //     for(const name in events){
    //         const handlerCode = genHandler(events[name])
    //         if(events[name] && events[name].dynamic){
    //             dynamicHandlers += `${name},${handlerCode},`
    //         }else{
    //             staticHandlers += `"${name}":${handlerCode},`
    //         }
    //     }
    //     return res.slice(0, -1) + '}'
    // }
    // /**
    //  * el.events = { input:{ value: "name = $event.target.value"} }
    //  * 
    // */
    // function genHandler(handler){
    //     if(!handler){
    //         return 'function(){}'
    //     }
    //     if(Array.isArray(handler)){
    //         return `[${handler.map(handler => genHandler(handler)).join(',')}]`
    //     }
    // }
    function genHandlers(events) {
      console.log("啥也不是=====!=====", events);
      console.log(">>>>>>>>>>>>>");
      var res = 'on:{';

      for (var name in events) {
        console.log("undefiend 还能执行？", events);
        res += "\'" + name + "\':" + ("function($event){  console.log('@@@@@@@@@数据变更@@@@@@@@',$event); " + events[name].value + ";}") + '.';
      }

      console.log("_________res______________", res);
      console.log("_____________________");
      return res.slice(0, -1) + '}';
    }

    class CodegenState {
      constructor(options) {
        this.options = options;
        this.warn = options.warn || baseWarn;
        this.directives = Object.assign({}, baseDirectives);
      }

    }

    function genDirectives(el, state) {
      const dirs = el.directives;
      if (!dirs) return;
      let res = 'directives:[';
      let hasRuntime = false;
      var i, l, dir, needRuntime;

      for (i = 0, l = dirs.length; i < l; i++) {
        dir = dirs[i];
        needRuntime = true;
        var gen = state.directives[dir.name];

        if (gen) {
          needRuntime = !!gen(el, dir, state.warn);
        } // console.log("=======成语借楼======",);
        // v-model, v-show


        if (needRuntime) {
          hasRuntime = true;
          res += `{name:${JSON.stringify(dir.name)}, rawName:${JSON.stringify(dir.rawName)}` + `${dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''}` + `},`;
          console.log("====111111111111=======", res);
        }
      }

      if (hasRuntime) {
        return res.slice(0, -1) + ']';
      }
    } // 代码生成器： 使AST生成render函数的代码字符串


    function generate(ast, options) {
      console.log("代码生成器==", ast);
      const state = new CodegenState(options);
      const code = ast ? genElement(ast, state) : '_c("div")';
      console.log("+++++++++++++++++++++", code);
      return {
        render: createFunction(`with(this){return ${code}}`),
        staticRenderFns: state.staticRenderFns
      };
    }

    function createFunction(code) {
      try {
        return new Function(code);
      } catch (err) {
        return '';
      }
    }

    function genElement(el, state) {
      let code;

      if (el.parent) {
        el.pre = el.pre || el.parent.pre;
      }

      if (el.staticRoot && !el.staticProcessed) ; else if (el.once && !el.onceProcessed) {
        return genOnce(el, state);
      } else if (el.for && !el.forProcessed) {
        return genFor(el, state);
      } else if (el.if && !el.ifProcessed) {
        return genIf(el, state);
      } else {
        if (el.component) ; else {
            let data; // el.plain 为true 该节点没有属性，不需要执行genData

            if (!el.plain || el.pre && state.maybeComponent(el)) {
              data = genData(el, state);
            }

            let children = genChildren(el, state);
            code = `_c('${el.tag}'${data ? `,${data}` : ''}${children ? `,${children}` : ''})`;
            return code;
          }
      }
    }

    function genChildren(el, state) {
      const children = el.children;

      if (children.length) {
        const el = children[0];

        if (children.length == 1 && el.for && el.tag !== 'template' && el.tag !== 'slot') {
          const normalizationType = checkSkip && state.maybeComponent(el) ? `,1` : ``;
          return `${genElement(el, state)}${normalizationType}`;
        }

        return `[${children.map(c => genNode(c, state)).join(',')}]`;
      }
    } // 拼接 ast上的属性;
    // 目标：{key: 3,ref: 'xx', id:'app', class: 'test' }


    function genData(el, state) {
      let data = '{';
      const dirs = genDirectives(el, state);

      if (dirs) {
        data += dirs + ',';
      }

      if (el.key) {
        data += `key:${el.key},`;
      } // console.log("我欲癫狂---",el.props);


      if (el.props) {
        data += `domProps:{${genProps(el.props)}},`;
      }

      if (el.events) {
        data += `${genHandlers(el.events)},`;
      }

      if (el.ref) {
        data += `ref:${el.ref}`;
      } // if(el.attrsList){
      //     data += `attrs:{${genProps(el.attrsList)}}`
      // }


      data = data.replace(/,$/, '') + '}'; // console.log("=========我疑惑了=============",data);

      return data;
    }

    function genProps(props) {
      let res = '';

      for (let i = 0, l = props.length; i < l; i++) {
        const prop = props[i];
        res += `'${prop.name}' : '${prop.value}',`;
      }

      return res.slice(0, -1);
    }

    function genNode(node, state) {
      if (node.type === 1) {
        return genElement(node, state);
      } else if (node.type == 3 && node.isComment) {
        return genComment(node);
      } else {
        return genText(node);
      }
    }

    function genText(text) {
      return `_v(${text.type === 2 ? text.expression : JSON.stringify(text.text)})`;
    }
    function genFor(el, state, altGen, altHelper) {
      const exp = el.for;
      const alias = el.alias;
      const iteractor1 = el.iteractor1 ? `,${el.iteractor1}` : '';
      const iteractor2 = el.iteractor2 ? `,${el.iteractor2}` : '';

      if (el.tag !== 'slot' && el.tag !== 'template' && !el.key) {
        state.warn(`<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` + `v-for should have explicit keys. ` + `See https://vuejs.org/guide/list.html#key for more info.`, el.rawAttrsMap['v-for'], true
        /* tip */
        );
      }

      el.forProcessed = true; // avoid recursion

      return `${altHelper || '_l'}((${exp})),` + `function(${alias}${iteractor1}${iteractor2}){` + `return ${(altGen || genElement)(el, state)}` + '})';
    }

    // creatCompilerCreator根据baseCompile创建出不同平台编译器

    const createCompier = createCompilerCreator(function baseCompile(template, options) {
      // 抽象语法树    
      const ast = parse(template.trim(), options);
      console.log("ast", ast);
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
     * 从new XVue创建、初始化数据、编译模板、挂载DOM和渲染、更新和渲染、卸载等的一系列过程  
     * */

    function XVue$1(options) {
      this._init(options);
    }

    let uid = 0;

    XVue$1.prototype._init = function (options) {
      const vm = this;
      vm.uid = uid++;
      vm.$options = options;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm); // 调用生命周期的钩子函数    

      callHook(vm, 'beforeCreate'); //initInjections(vm) // resolve injections before data/props

      initState(vm); // initProvide(vm) // resolve provide after data/props

      callHook(vm, 'created'); //   

      if (vm.$options.el) {
        vm.$mount(vm, vm.$options.el);
      }
    }; // hydrating 用于Virtual DOM补丁算法


    XVue$1.prototype.$mount = (vm, el, hydrating) => {
      el = el && document.querySelector(el);
      const options = vm.$options;

      if (!options.render) {
        // render函数不存在,使用template, template不存在=>el
        let template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        } //template经过编译后得到render


        const {
          render
        } = compileToFunction(template, {}, vm);
        options.render = render;
      } //挂载


      mountComponent(vm, el, hydrating);
    };

    return XVue$1;

})));
