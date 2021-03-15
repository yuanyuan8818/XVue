
import {installRenderHelpers} from '../vdom/render-helper/index'

import {warn} from '@/core/util/index'
import { mountElement } from '../mount-helper/element'
import { mountText } from '../mount-helper/text'
import { VNodeFlags } from '../vdom/vnode'
export function initRender(vm){
    vm._vnode = null
    vm._staticTrees = null

    //vm._c 是用于编译器根据模板字符串生渲染函数的
    // vm._c = (a,b,c,d) => createElement(vm,a,b,c,d,false)
    // vm.$createElement = (a,b,c,d) => createElement(vm,a,b,c,d,true)

    XVue.prototype._update = function(vnode,hy){
        const vm = this 
        let container = vm.$el;
        const prevVNode = vm._vnode;
        const parent = vm.$parent
        let parentElm = null 

        if(prevVNode == null){
            // 没有旧的VNode， 使用"mounnt"函数挂在全新的VNode
            if(!parent){
                // 没有parent，是根节点渲染
                parentElm = container.parentNode
                console.log("能拿到吗？？？？？？？？",parentElm);
                parentElm && parentElm.removeChild(container)
                container = parentElm
            }else{
                container = parent
            }
            if(vnode){
                mount(vnode,container)
                container.vnode = vnode
            }            
        }else{
            if(vnode){
                //有旧的VNode, 则调用'patch'函数打补丁
                patch(prevVNode,vnode,container)            
                container.vnode = vnode
            }else{
                // 有旧的vnode，但是没有新的vnode，直接移除旧的
                container.removeChild(prevVNode.el)
                container.vnode = null
            }            
        }

    }

    XVue.prototype._render = function(){
        const vm = this;
        const { render } = vm.$options
        let vnode;
        try{
            console.log("社会很单纯~~~~~",render);
            vnode = render.call(vm)
            console.log("执)))___________数，生成虚拟dom",vnode);
        }catch(e){
            warn(`Render Error:${e}`);
        }
        return vnode
    }

    // 组装渲染函数方法
    installRenderHelpers(XVue.prototype);
    
}


export function mount(vnode,container,refVNode){
    const flags = vnode.flags
    console.log("^^^^^开始挂载&&&&&&&&",vnode);
    if(flags & VNodeFlags.ELEMENT){
        console.log("开始挂载普通标签--------",container);
        // 挂载普通标签
        mountElement(vnode,container,refVNode)
    }else if(flags & VNodeFlags.COMPONENT){
        // 挂载组件
    }else if(flags & VNodeFlags.FRAGMENT){
        // 挂载Fragment
    }else if(flags & VNodeFlags.TEXT){
        // 挂载纯文本
        mountText(vnode,container)
    }
}