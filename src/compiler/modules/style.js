import { getAndRemoveAttr,getBindingAttr } from "../../Compiler/helpers"
import { parseStyleText } from 'web/util/style'

function transformNode(el,options){
    const staticStyle = getAndRemoveAttr(el,'style')
    if(staticStyle){
        el.staticKeys = JSON.stringify(parseStyleText(staticStyle))
    }

    const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
    if (styleBinding) {
      el.styleBinding = styleBinding
    }
}

export default {
    staticKeys: ['staticStyle'],
    transformNode
} 