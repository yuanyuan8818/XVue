
export function createTextVNode(text){
    return {
        _isVNode: true,
        flags: VNodeFlags.TEXT,
        tag: null,
        data: null,
        children: text,

    }
}



export const VNodeFlags = {
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
}
//html 和 svg都是标签元素，都可以用ELMENT标识
VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG
// 有状态组件： 普通有状态组件, 需要被keepAlive和已经被keptAlive的组件
VNodeFlags.COMPONENT_STATEFUL = VNodeFlags.COMPONENT_STATEFUL_NORMAL 
                                | VNodeFlags.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE
                                | VNodeFlags.COMPONENT_STATEFUL_KEPT_ALIVE 
// 有条件组件和函数式组件都是组件
VNodeFlags.COMPONENT = VNodeFlags.COMPONENT_STATEFUL | VNodeFlags.COMPONENT_FUNCTIONAL


export const ChildrenFlags = {
    // 未知的children类型
    UNKNOWN_CHILDREN: 0,
    // 没有children
    NO_CHILDREN: 1,
    // children是单个VNode
    SINGLE_VNODE: 1<<1,

    //children是拥有多个key的VNode
    KEYED_VNODES: 1<< 2,
    // children是没有key的VNode
    NONE_KEYED_VNODES: 1<<3
}

ChildrenFlags.MULTIPLE_VNODES = ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES

/**
 * h函数即_c, 用于生产vnode
*/
export function h(tag, data = null, children = null, chldrenDeep){        
    let flags = null         
    if(typeof tag=='string'){
        flags = tag == 'svg' ? VNodeFlags.ELEMENT_SVG: VNodeFlags.ELEMENT_HTML        
    }else if(tag == Fragment){
        flags = VNodeFlags.FRAGMENT
    }else{
            // 兼容 Vue2 的对象式组件
        if (tag !== null && typeof tag === 'object') {
            flags = tag.functional
            ? VNodeFlags.COMPONENT_FUNCTIONAL       // 函数式组件
            : VNodeFlags.COMPONENT_STATEFUL_NORMAL  // 有状态组件
        } else if (typeof tag === 'function') {
            // Vue3 的类组件
            flags = tag.prototype && tag.prototype.render
            ? VNodeFlags.COMPONENT_STATEFUL_NORMAL  // 有状态组件
            : VNodeFlags.COMPONENT_FUNCTIONAL       // 函数式组件
        }
    }

    let childFlags = null
    console.log("^^^^^^^^^^^^^^^^^^^^: children",children);
    if(Array.isArray(children)){
        let {length} = children
        if(length == 0){
            // 没有children
            childFlags = ChildrenFlags.NO_CHILDREN
        }else if(length == 1){
            // 单个子节点
            childFlags = ChildrenFlags.SINGLE_VNODE
            children = children[0]
        }else {
            // 多个子节点，切子节点使用key
            childFlags = ChildrenFlags.KEYED_VNODES
            // children = normalizeVNodes(children)            
        }
    }else if(children == null){
        // 没有子节点
        childFlags = ChildrenFlags.NO_CHILDREN
    }else if( children ){
        // if(children._isVNode)
        // 单个子节点
        childFlags = ChildrenFlags.SINGLE_VNODE
    }else {
        childFlags = ChildrenFlags.SINGLE_VNODE
        children = createTextVNode(children + '')
    }
    
    console.log("dddddddddd");
    let vnode = {
        _isVNode: true,
        flags,
        tag,
        data,
        children,
        childFlags,
        el:null
    }    

    // console.log("看下蹙额你**********************",vnode);
    return vnode

    // return {
    //     _isVNode: true,
    //     flags,
    //     tag,
    //     data,
    //     children,
    //     childFlags,
    //     el:null
    // }
}

// export function createElement(){

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