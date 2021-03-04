
import {parseHTML} from './html-parser'
// import {parseText} from './text-parser'

// parse在词法分析的基础上做句法分析
export function parse(template,options){

    // 词法分析
    parseHTML(template,{
        start(tag,attrs,unary,start,end){

        },
        end(){

        },
        chars(text){

        },
        comment(){

        }

    })
    return root
}