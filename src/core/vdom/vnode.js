
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
    ELEMENT_HTML: 1,
    ELEMENT_SVG: 1 << 1,
    COMPONENT_STATEFUL_NORMAL: 1 << 2,
    COMPONENT_STATEFUL_KEPT_ALIVE: 1 << 3,
    COMPONENT_FUNCTIONAL: 1 << 4,
    TEXT: 1 << 5
}

/**
 * h函数即_c, 用于生产vnode
*/
export function h(tag, data = null, children = null, chldrenDeep){
    if(Array.isArray(data)){
        children = data
        data = null
    }
    let flags = null 
    
}