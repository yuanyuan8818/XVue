
import Watcher from '@/core/observer/watcher.js'
export function initLifecycle(vm){
    const options = vm.$options

    vm._watcher = null
    vm._isMounted = false
    vm._isDestroyed = false

}

export function callHook(vm,hook){    
    const handlers = vm.$options[hook]
    if(handlers){
        handlers.call(vm)
    }           
}

// 完成挂载工作
export function mountComponent(vm,el,hydrating){
    vm.$el = el 
    callHook(vm,'beforMount')
    let updateComponent
    // updateComponent把渲染函数生成的虚拟DOM渲染成真正的DOM
    updateComponent = ()=>{
        // vm._render() 生成vnode
        // vm._update() 通过虚拟DOM的补丁算法来完成
        // vm._update(vm._render(),hydrating)
        console.log("执行渲染函数生成vnode， 将vnode转化为真实dom")
    }

    // 渲染函数的watcher
    new Watcher(vm, updateComponent,{})
    if(vm.$vnode == null){
        vm._isMounted = true
        callHook(vm,'mounted')
    }
    return vm
}