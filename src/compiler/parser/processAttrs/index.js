import { addHandler,addDirective } from "../../helpers"
import { parseFilters } from "../filter-parser"
import {onRE} from '../index'
const dirRE = /^v-|^@|^:/ 
// const modifierRE = /\.[^.]+/g
const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g
const bindRE = /^:|^v-bind:/
const argRE = /:(.*)$/



export function processAttrs(el){    
    const list = el.attrsList
    let i, l, name, rawName, value, modifiers, isProp
    for(i = 0, l = list.length; i < l; i++){
        name = rawName = list[i].name    
        value = list[i].value            
        if(dirRE.test(name)){  //匹配是否有指令 v- 开头 @即 v-on     : 即 v-bind      const dirRE = /^v-|^@|^:/  
            // mark element as dynamic 
            el.hasBindings = true
            // modifiers 修饰符
            modifiers = parseModifiers(name)
            if(modifiers){
                name = name.replace(modifierRE, '')
            }
            
            if(bindRE.test(name)){ // v-bind     bindRE = /^:|^v-bind:/
                name = name.replace(bindRE,'')     // eg  v-bind:some-prop.sync 先用''替换掉修饰符，再替换掉v-bind
                // parseFilter用来将表达式和过滤器整合在一起
                value = parseFilters(value)
                // isProp标识着该绑定属性是否是原生DOM对象  eg  innherHtml 通过 .访问
                isProp = true

                // 处理 v-bind的修饰符
                // to do...

                // if ((modifiers && modifiers.prop) || (
                //     !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
                //   )) {
                //     addProp(el, name, value, list[i], isDynamic)
                //   } else {
                //     addAttr(el, name, value, list[i], isDynamic)
                //   }
                
            }else if(onRE.test(name)){  // v-on
                name = name.replace(onRE, '')
                addHandler(el,name,value,modifiers,false,warn)
            }else{  // normal directives  v-model 也在此间
                name = name.replace(dirRE, '')
                // parse arg 
                const argMatch = name.match(argRE)
                const arg = argMatch && argMatch[1]
                if(arg){
                    name = name.slice(0, -(arg.length +1))
                }                
                addDirective(el, name, rawName, value, arg, modifiers)
                                
                // if(name === 'model'){
                //     checkForAliasModel(el, value)
                // }                
            }
        }else{

        }
    }
    

}

function parseModifiers(name){
    const match = name.match(modifierRE)
    if(match){
        const ret = {}
        match.forEach(m=>{
            ret[m.slice(1)] = true
        })
        return ret 
    }
}

function checkForAliasModel(el,value){
    let _el = el 
    while (_el) {
        if (_el.for && _el.alias === value) {
        warn(
            `<${el.tag} v-model="${value}">: ` +
            `You are binding v-model directly to a v-for iteration alias. ` +
            `This will not be able to modify the v-for source array because ` +
            `writing to the alias is like modifying a function local variable. ` +
            `Consider using an array of objects and use v-model on an object property instead.`
        )
        }
        _el = _el.parent
    }
}