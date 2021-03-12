
import {initLifecycle,callHook,mountComponent} from '@/core/instance/lifecycle.js'
import {initEvents} from '@/core/instance/events.js'
import {initRender} from '@/core/instance/render.js'
import {mergeOptions} from '@/util/options.js'
import {initState} from '@/core/instance/state.js'
import {compileToFunction} from './compiler/index'

/**
 * XVue的生命周期：
 *  从new XVue创建、初始化数据、编译模板、挂载DOM和渲染、更新和渲染、卸载等的一系列过程 
 *  */ 

function XVue(options){    
   this._init(options)
}

let uid = 0

XVue.prototype._init = function(options){
    const vm = this
    vm.uid = uid++
    vm.$options = options

    // vm.$options = mergeOptions(
    //     Vue.options,
    //     options || {},
    //     vm
    // )

    vm.$options = options

    initLifecycle(vm)
    initEvents(vm)    
    initRender(vm) 
    // 调用生命周期的钩子函数    
    callHook(vm,'beforeCreate')
    //initInjections(vm) // resolve injections before data/props
    initState(vm)  
    // initProvide(vm) // resolve provide after data/props
    callHook(vm,'created') //   
    
    if(vm.$options.el){
        vm.$mount(vm,vm.$options.el)
    }
}

// hydrating 用于Virtual DOM补丁算法
XVue.prototype.$mount = (vm,el,hydrating)=>{
    el = el && document.querySelector(el)
    const options = vm.$options
   if(!options.render){
       // render函数不存在,使用template, template不存在=>el
       let template = options.template
       if(!template && el){
           template = el.outerHTML
       }

       const {render} = compileToFunction(template,{},vm)
       options.render = render       
   }
   // 如render存在，调用mountComponent
//    return mount.call(this, el, hydrating)
     mountComponent(vm, el, hydrating)
}

export default XVue