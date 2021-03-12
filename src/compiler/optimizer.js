import {isBuiltInTag, makeMap,cached,no } from '@/shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)
 function genStaticKeys(keys){
    return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' + 
    (keys? ',' + keys : '')
    )
}

// 对AST优化，进行静态标注
// 静态节点: 永远不需要变化的DOM就是静态的
export function optimize(root, options){    
    if(!root) return
    isStaticKey = genStaticKeysCached(options.isStaticKey || '')    
    isPlatformReservedTag = options.isReservedTag || no    
    // markStatic(root) // 标注静态节点
    // markStaticRoots(root,false) // 标注静态根节点    
}

function markStatic(node){
    node.static = isStatic(node)    
}

function markStaticRoots(node, isInFor){    
    if(node.type === 1){
        if(node.static || node.once){
            node.staticInFor = isInFor
        }

        /**
         * 标注静态根节点的要求：
         * 1. 自身是静态节点  node.static
         * 2. 有子节点 node.children.length
         * 3. 子节点不能仅为一个文本节点 !(node.children.length == 1 && node.chldren[0].type ==3)                  
         *  */         
        if(node.static && node.children.length && !(
            node.children.length === 1 &&
            node.children[0].type === 3
        )){
            node.staticRoot = true
            return             
        }else{
            node.staticRoot = false
        }
        if(node.children){
            for(let i = 0, l = node.children; i <l; i++){
                markStaticRoots(node.children[i], isInFor || !!node.for)
            }
        }        
    }
}


function isStatic(node){
    if(node.type === 2){  //expression
        return false
    }
    if(node.type === 3){ //text
        return true
    }

    return !!(node.pre || (
        !node.hasBindings && // no dynamic bindings
        !node.if && !node.for && 
        !isBuiltInTag(node.tag)
        // isPlatformReservedTag(node.tag) &&
        // !isDirectChildOfTemplateFor(node) &&
        // Object.keys(node).every(isStaticKey)
    ))

}