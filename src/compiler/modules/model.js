// import { getBindingAttr } from "../../Compiler/helpers"
// import { createASTElement, processFor } from "../../Compiler/parser"
import {
    getBindingAttr,
    getAndRemoveAttr,
    addRawAttr
} from 'compiler/helpers'

import {
    processFor,
    processElement,
    addIfCondition,
    createASTElement
  } from 'Compiler/parser/index'

function preTransformNode(el,options){
    //处理的是 绑定v-model的input标签的type属性
    if(el.tag === 'input'){
        const map = el.attrsMap
        if(!map['v-model']){
            return
        }

        let typeBinding
        if(map[':type'] || map['v-bind:type']){
            typeBinding = getBindingAttr(el,'type')
        }
        if(!map.type && !typeBinding && map['v-bind']){ 
            // <input v-model="val" v-bind="{type: inputType}">
            typeBinding = `(${map['v-bind']}).type`
        }
        if(typeBinding){
            const ifConditions = getAndRemoveAttr(el,'v-if',true)
            const ifConditionExtra = ifCondition ? `&&(${ifCondition})` : ``
            const hasElse = getAndRemoveAttr(el,'v-else', true) !=null
            const elseIfCondition = getAndRemoveAttr(el,'v-else-if',true)
            /* preTransformNode函数的作用是将一个拥有绑定类型(type)的v-model指令的input标签
            *  扩展为三个input标签，这三个input标签分别是复选按钮(checkbox)、单选按钮(radio)和其他input标签
            **/
            // 1. checkbox
            const branch0 = cloneASTElement(el)
            // process for on the main node
            processFor(branch0)
            addRawAttr(branch0,'type','checkbox')
            processElement(branch0,'type','checkbox')
            branch0.processed = true
            /* <input v-model='val' :type="inputType" v-if="display" />
            * el.if属性为 '(${inputType}) === 'checkbox'&&display'  inputType为checkbox且本地状态display为真才会渲染该复选按钮*/
            branch0.if = `(${typeBinding}) === 'checkbox'` + ifConditionExtra
            addIfCondition(branch0,{
                exp: branch0.if,
                block: branch0
            })
            // 2. add radio else-if condition            
            const branch1 = cloneASTElement(el)
            /* 单纯的将克隆出来的元素描述对象中的v-for属性移除掉,因为在复选按钮中已经使用processFor处理过了v-for指令
             * 由于它们本是互斥的,其本质上等价于是同一个元素，只是根据不同的条件渲染不同的标签罢了，所以v-for指令处理一次就够了*/
            getAndRemoveAttr(branch1, 'v-for', true)             
            addRawAttr(branch1, 'type', 'radio')
            processElement(branch1,options)
            addIfCondition(branch0,{
                exp: `(${typeBinding} === 'radio')` + ifConditionExtra,
                block: branch1
            })
             // 3. other
            const branch2 = cloneASTElement(el)
            getAndRemoveAttr(branch2, 'v-for', true)
            addRawAttr(branch2, ':type', typeBinding)
            processElement(branch2, options)
            addIfCondition(branch0, {
                exp: ifCondition,
                block: branch2
            })

            if (hasElse) {
                branch0.else = true
              } else if (elseIfCondition) {
                branch0.elseif = elseIfCondition
              }
        
            return branch0
            
        }
    }   
}

function cloneASTElement(el){
    return createASTElement(el.tag, el.attrsList.slice(), el.parent)
}

export default {
    preTransformNode
}