

export function initRender(vm){
    vm._vnode = null
    vm._staticTrees = null

    //vm._c 是用于编译器根据模板字符串生渲染函数的
    vm._c = (a,b,c,d) => createElement(vm,a,b,c,d,false)
    vm.$createElement = (a,b,c,d) => createElement(vm,a,b,c,d,true)
    
}