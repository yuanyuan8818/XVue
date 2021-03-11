
import {parseHTML} from './html-parser'

// import {parseText} from './text-parser'
export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:/  //匹配是否有指令 v- 开头 @即 v-on     : 即 v-bind
export const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
const stripParensRE = /^\(|\)$/g
const argRE = /:(.*)$/
export const bindRE = /^:|^v-bind:/
const modifierRE = /\.[^.]+/g

function makeAttrsMap(attrs){
    const map = {}
    let l = attrs.length;
    for(let i = 0;  i<l ; i++){
        map[attrs[i].name] = attrs[i].value
    }
    return map
}

const currentParent = null
export function createASTElement(tag,attrs,parent){
    let ele = {
        type: 1,
        tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent,
        children: []
    }
    return ele
}

function warnOnce(msg){    
    if(!warned){
        warned = true
        warn(msg)
    }
}

const root = null
// parse在词法分析的基础上做句法分析
export function parse(template,options){

    function checkRootConstraints(el){
        if(el.tag === "slot" || el.tag === "template"){
            warnOnce(`Cannot user <${el.tag}> as component root element becasue it may contain multiple nodes`)
        }
        if(el.attrsMap.hasOwnProperty('v-for')){
            warnOnce(`Cannot use v-for on stateful component root element because it renders multiple elements. `)
        }
    }
    // 词法分析
    parseHTML(template,{
        start(tag,attrs,unary,start,end){
            let element = createASTElement(tag,attrs,currentParent)
            if(!root){
                root = element
                checkRootConstraints(root)
            }else{
                if(!unary){
                    stack.push(Element)
                    currentParent = element
                }                
            }
        },
        end(){
            stack.pop()
            currentParent = stack[stack.length -1]
        },
        chars(text){

        },
        comment(){

        }

    })
    return root
}