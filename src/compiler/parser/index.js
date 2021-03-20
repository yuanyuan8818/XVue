import {parseHTML} from './html-parser'
import {parseText} from './text-parser'
import { 
    getAndRemoveAttr,
    getBindingAttr,
    addHandler,
    pluckModuleFunction,
    baseWarn
 } from '../helpers'
 import {processAttrs} from './processAttrs/index'

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

function processElement(element,options){
    processAttrs(element)

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

let warned = false

function warnOnce(msg){    
    if(!warned){
        warned = true
        warn(msg)
    }
}

export let warn,transforms,preTransforms,delimiters
// parse在词法分析的基础上做句法分析
export function parse(template,options){
    let root = null
    let stack = []
    let currentParent

    warn = options.warn || baseWarn

    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')
    transforms = pluckModuleFunction(options.modules, 'transformNode')       

    function closeElement(element){
        if(!stack.length && element != root){
            // stack 为空，且element不是根元素
            /**
             *  <div v-if = "xx"> </div>
             *  <div v-else> </div>
             */
            if(root.if && (element.elseif || element.else)){
                checkRootConstraints(element)
            }
            addIfCondition(root,{
                exp: element.elseif,
                block:element
            })
        }else{
            warnOnce(
                `Component template should contain exactly one root element. ` +
                `If you are using v-if on multiple elements, ` +
                `use v-else-if to chain them instead.`,
                { start: element.start }
            )
        }       
    }
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
        warn: '',
        expectHTML: options.expectHTML,
        isUnaryTag: options.isUnaryTag,
        canBeLeftOpenTag: options.canBeLeftOpenTag,
        start(tag,attrs,unary,start,end){
            let element = createASTElement(tag,attrs,parent)

            // apply pre-transforms
            for (let i = 0; i < preTransforms.length; i++) {                
                element = preTransforms[i](element, options) || element
            }

            if(!element.processed){
                // 如果存在v-if等，则给element添加if  elseif等属性
                // structural directives
                // processIf(element)
                // processFor(element)
                
                processElement(element,options)
            }
            
            if(!root){
                root = element
                checkRootConstraints(root)
            }                        

             // currentParent
            if(currentParent){
                if(element.elseif || element.else){
                    /** 当元素使用了 v-else-if 或 v-else指令时，它们不会作为父级元素节点的
                     *  而是会被添加到相符的v-if指令的元素描述对象的ifConditions数组中            
                     */
                    processIfConditions(element,currentParent)
                }else{                    
                    currentParent.children.push(element)
                    element.parent = currentParent
                }
            }

            if(!unary){
                // 非一元，unary=false
                stack.push(element)                
                currentParent = element
            }else{
                //一元，直接闭合标签
                closeElement(element)
            }                
            
        },
        end(){
            let element = stack[stack.length -1]
            stack.length -= 1
            currentParent = stack[stack.length -1]
            closeElement(element)
        },
        chars(text,start,end){
            if(!currentParent){
                // 说明当前template内不存在根节点，元素节点就是全部内容
                return
            }
            const children = currentParent.children
            
            let res
            let child 
            if(text){
                // parseText用来解析文本内容
                // <div> 我的名字是: {{name}} </div> 该text包含 字面量表达式
                if(text!= '' && (res = parseText(text))){
                    child = {
                        type: 2,
                        expression: res.expression,
                        tokens: res.tokens,
                        text
                    }
                }else{
                    // 文本是空格节点或者 parseText解析失败即是纯文本
                    child = {
                        type: 3,
                        text
                    }
                }
                if(child){
                    children.push(child)
                }
            }
        },
        comment(){
            currentParent.children.push({
                type: 3,
                text,
                isComment: true
            })
        }

    })
    return root
}




export function addIfCondition(el, condition) {
    if (!el.ifConditions) {
        el.ifConditions = []
    }
    el.ifConditions.push(condition)
}
