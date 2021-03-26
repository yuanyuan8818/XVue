import { addIfCondition } from "..";
import { getAndRemoveAttr } from "../../helpers";


export function processIf(el){
    const exp = getAndRemoveAttr(el,'v-if')
    if(exp){
        el.if = exp
        addIfCondition(el,{
            exp:exp,
            block:el
        })
    }else{
        if(getAndRemoveAttr(el,'v-else') != null ){
            el.else = true
        }
        const elseif = getAndRemoveAttr(el, 'v-else-if')
        if(elseif){
            el.elseif = elseif
        }
    }
}

