import {getAndRemoveAttr} from '../../helpers'

export function processFor(el){
    let exp 
    if( exp = getAndRemoveAttr(el,'v-for') ){
        console.log("你瞧见我做啥了吗",exp);
    }


}