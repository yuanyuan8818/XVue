import baseDirectives from '../directives/index'
import {genHandlers} from './events'

export class CodegenState{
    constructor(options){
        this.options = options
        this.warn = options.warn || baseWarn
        this.directives = Object.assign({},baseDirectives)
    }
}

function genDirectives(el,state){
    const dirs = el.directives 
    if(!dirs) return
    let res = 'directives:['
    let hasRuntime = false 
    var i, l, dir, needRuntime
    for(i = 0, l = dirs.length; i< l; i++){
        dir = dirs[i]
        needRuntime = true        
        
        var gen = state.directives[dir.name]
        if(gen){
            needRuntime = !!gen(el,dir,state.warn)
        }
        
        // v-model, v-show
        if(needRuntime){
            hasRuntime = true
            res += `{name:${JSON.stringify(dir.name)}, rawName:${JSON.stringify(dir.rawName)}`
                    + `${dir.value ? `,value:${dir.value},expression:${JSON.stringify(dir.value)}` 
                    : ''}` + `},`        
            console.log("==genDirectives=======",res);
        }        
    }

    if (hasRuntime) {
        return res.slice(0, -1) + ']';
    }

} 

// 代码生成器： 使AST生成render函数的代码字符串
export function generate(ast,options){    
    console.log(" codegen 入口----",ast);
    const state = new CodegenState(options)        
    const code = ast ? genElement(ast,state): '_c("div")'  
    console.log("+++++++++++++++++++++",code);  
    return {                
        render: createFunction(`with(this){return ${code}}`),        
        staticRenderFns: state.staticRenderFns
    }
}

function createFunction(code){    
    try{
        return new Function(code)
    }catch(err){
        return ''
    }

}

export function genElement(el,state){
    let code 
    if(el.parent){
        el.pre = el.pre || el.parent.pre
    }

    if(el.staticRoot && !el.staticProcessed){
        // return genStatic(el,state)
    }else if(el.once && !el.onceProcessed){
        return genOnce(el,state) 
    }else if(el.for && !el.forProcessed){
        return genFor(el,state)
    }else if(el.if && !el.ifProcessed){
        return genIf(el,state)
    }else{
        if(el.component){
            // code = genComponent(el.component, el, state)
        }else{
            let data
            // el.plain 为true 该节点没有属性，不需要执行genData
            if(!el.plain || (el.pre && state.maybeComponent(el))){            
                data = genData(el, state)            
            }

            let children = genChildren(el,state,true)
            code = `_c('${el.tag}'${data?`,${data}`:''}${children?`,${children}`: ''})`                            
            return code
        }

    }
}

function genChildren(el,state){
    const children = el.children
    if(children.length){
        const el = children[0]        
        if(children.length == 1 && el.for && el.tag !== 'template' && el.tag !== 'slot'){
            const normalizationType = checkSkip && state.maybeComponent(el) ? `,1` : ``            
            return `${genElement(el,state)}${normalizationType}`
        }
        return `[${children.map(c=> genNode(c,state)).join(',')}]`
    }

}

// 拼接 ast上的属性;
// 目标：{key: 3,ref: 'xx', id:'app', class: 'test' }
function genData(el,state){
    let data = '{'
    
    const dirs = genDirectives(el,state)        
    if(dirs){
        data += dirs + ','        
    } 
    
    if(el.key){
        data += `key:${el.key},`
    }    

    if(el.props){
        data += `domProps:{${genProps(el)}},`
    }
    
    if(el.events){
        data += `${genHandlers(el.events,false)},`
    }
    
    if(el.ref){
        data += `ref:${el.ref}`
    }
    // if(el.attrsList){
    //     data += `attrs:{${genProps(el.attrsList)}}`
    // }
    data = data.replace(/,$/,'') + '}'    
    return data
}

function genProps(el){
    const props = el.props
    let res = ''
    for(let i = 0, l = props.length; i < l; i++ ){
        const prop = props[i]
        res += `'${prop.name}' : ${prop.value},`
    }
    return res.slice(0,-1)
}

function genNode(node,state){    
    if(node.type ===1){
        return genElement(node,state)
    }else if(node.type == 3 && node.isComment){
        return genComment(node)
    }else{        
        return genText(node)
    }
}

export function genText(text){    
    return `_v(${text.type === 2 ? text.expression: JSON.stringify(text.text)})`
}

export function genFor(el,state,altGen,altHelper){
    const exp = el.for
    const alias = el.alias
    const iteractor1 = el.iteractor1 ? `,${el.iteractor1}` : ''
    const iteractor2 = el.iteractor2 ? `,${el.iteractor2}` : ''

    console.log("el.key。。？",el.key);
    if(el.tag !== 'slot' && el.tag !== 'template' && !el.key){
        console.error(
            `<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
            `v-for should have explicit keys. `                                   
          )
    }

    el.forProcessed = true // avoid recursion

    return `${altHelper || '_l'}(${exp},` + 
       `function(${alias}${iteractor1}${iteractor2}){` +
         `return ${(altGen || genElement)(el,state)}` +
         '})'
}