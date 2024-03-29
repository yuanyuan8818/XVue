


export function compareDoubleEnd(prevChildren,nextChildren,container){
    const oldStartIdx = 0
    const oldEndIdx = oldChildren.length - 1 

    const newStartIdx = 0    
    const newEndIdx = prevChildren.length -1 
       
    const newStartVnode = nextChildren[newStartIdx]
    const oldStartVnode = prevChildren[oldStartIdx]

    const newEndVnode = nextChildren[newEndIdx]
    const oldEndVnode = prevChildren[oldEndIdx]

    while(oldStartIdx < oldEndIdx && newStartIdx < newEndIdx){
        if(!oldStartVnode){
            oldStartVnode = prevChildren[++oldStartVnode]
        }else if(!oldEndVnode){
            oldEndVnode = prevChildren[--oldEndVnode]
        }else if(oldStartVnode.key == newStartVnode.key){
            patch(oldStartVnode,newStartVnode,container)
            oldStartVnode = prevChildren[++oldStartIdx]
            newStartVnode = nextChildren[++newStartIdx]
        }else if(oldEndVnode.key == newEndVnode.key){
            patch(oldEndVnode,newEndVnode,container)
            oldEndVnode = prevChildren[--oldEndIdx]
            newEndVnode = prevChildren[--newEndIdx]
        }else if(oldStartVnode.key == newEndVnode.key){
            patch(oldStartVnode,newEndVnode,container)
            // 旧头和新尾相同，说明旧头被移动到了“最后”
            container.insertBefore(oldStartVnode.el,oldEndVnode.el.nextSibiling)
            oldStartVnode = prevChildren[++oldStartIdx]
            newEndVnode = nextChildren[--newEndIdx]
        }else if(oldEndVnode.key == newStartVnode.key){
            patch(oldEndVnode,newStartVnode,container)
            // 旧尾与新头相同，说明旧尾被移动到了“最前”
            container.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = prevChildren[--oldEndIdx]
            newStartVnode = nextChildren[++newStartIdx]
        }else{

            let iodx = prevChildren.findIndex(prevVnode=> prevVnode.key == newStartVnode.key)
            if(iodx>=0){
                patch(prevChildren[iodx],newStartVnode,container)
                container.insertBefore(prevChildren[iodx],oldStartVnode)
                prevChildren[iodx] = undefined
                newStartIdx++
            }else{
                let refVNode = oldStartVnode
                mount(newStartVnode,container,refVNode) // 最后一个传参代表使用insertBefore插入到refVNode之前
                newStartIdx++
            }
        }
    }

    if(oldStartIdx > oldEndIdx){
        // 旧节点先遍历完，需挂载剩余的新节点
        for(let i = newStartIdx; i >= newEndIdx ; i--){            
            mount(nextChildren[i],container,false, oldStartVnode.el)
        }

    }

    if(newStartIdx > newEndIdx){
        // 新节点先遍历完，需移除剩余的旧节点
        for(let i = oldStartIdx; i <= oldEndIdx; i++){
            container.removeChild(prevChildren[i].el)            
        }
    }    
}