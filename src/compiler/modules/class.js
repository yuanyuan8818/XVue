import { getAndRemoveAttr,getBindingAttr } from "../../Compiler/helpers"

function transformNode(el,options){
    const staticClass = getAndRemoveAttr(el,'class')
    if(staticClass){
        el.staticClass = JSON.stringify(staticClass)
    }
    const classBinding = getBindingAttr(el,'class',false)
    if(classBinding){
        el.classBinding = classBinding
    }
}


export default {
    staticKeys: ['staticClass'],
    transformNode,
} 