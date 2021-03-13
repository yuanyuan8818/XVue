
import {installRenderHelpers} from '../vdom/render-helper/index'

import {warn} from '@/core/util/index'
export function initRender(vm){
    vm._vnode = null
    vm._staticTrees = null

    //vm._c 是用于编译器根据模板字符串生渲染函数的
    // vm._c = (a,b,c,d) => createElement(vm,a,b,c,d,false)
    // vm.$createElement = (a,b,c,d) => createElement(vm,a,b,c,d,true)

    XVue.prototype._update = function(vnode,hy){

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