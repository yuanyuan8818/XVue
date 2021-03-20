
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
        for(let i = 0, j = handlers.length; i <j ; i++){            
            try{
                handlers[i].call(vm)
            }catch(e){
                console.error(`[XVue]:  ${hook} hook`)
            }
        }        
    }           
}

// 挂载
export function mountComponent(vm,el,hydrating){
    vm.$el = el 
    callHook(vm,'beforeMount')
    let updateComponent
    // updateComponent把渲染函数生成的虚拟DOM渲染成真正的DOM
    updateComponent = ()=>{            
        const vnode = vm._render()
        console.log("vnode: ",vnode);
        vm._update(vnode,hydrating)        
    }

    // 渲染函数的watcher
    new Watcher(vm, updateComponent,{})
    if(vm.$vnode == null){
        vm._isMounted = true
        callHook(vm,'mounted')
    }
    return vm
}