import { addHandler,addProp } from "../helpers"

export default function model(el,dir,_warn){
    const value = dir.value
    const tag = el.tag 
    const type = el.attrsMap.type

    console.log("会进来这里的==？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？=",);

    if(el.component){
        genComponentModel(el,value)
    }else if(tag === 'select'){
        genSelect(el,value)            
    }else if(tag === 'input' && type === 'checkbox'){
        genCheckboxModel(el,value)
    }else if(tag === 'input' && type == 'radio'){
        genRadioModel(el, value);
    }else if(tag === 'input' || tag === 'textarea'){
        genDefaultModel(el,value)
    }else if(!isHTMLTag(tag)){
        return false
    }else{
            warn(`<${el.tag} m-model="${value}">: ` +
            `m-model is not supported on this element type. `)
    }    
    return true
}


function genSelect(el,value){

}

function genCheckboxModel(){

}

function genRadioModel(){

}

function onCompositionStart (e) {
    e.target.composing = true
}

function onCompositionEnd (e) {
    // prevent triggering an input event for no reason
    if (!e.target.composing) return
    e.target.composing = false
    // trigger(e.target, 'input')
  }

  function trigger (el, type) {
    const e = document.createEvent('HTMLEvents')
    e.initEvent(type, true, true)
    el.dispatchEvent(e)
  }
  


const directive = {
    inserted(el,binding,vnode,oldVnode){
        if(vnode.tag === 'select'){

        }else if(vnode.tag === 'textarea') {
            el.addEventListener('compositionstart', onCompositionStart)
        }

    }
}

/**
 * 对input输入框 textarea处理
 */
function genDefaultModel(el,value){
    const type = el.attrsMap.type;
    {
        const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value']
        if(value){
            const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value'
            warn(`${binding}="${value}" conflicts with v-model on the same element `)
        }
    }

    const needComposiion = type !== 'range';
    const event = type === 'range' ? '__r' : 'input';
    let valueExpression = `$event.target.value`;
    let code = genAssignmentCode(value, valueExpression);    
    console.log("+=====!!!!!!!!!!!!!!!!!!!!!!!!!==",code);
    if (needComposiion) {        
        code = `if($event.target.composingTT)return;${code}`
    }
    console.log("?can not read value!!!!",value);
    // addProp(el, 'value', value);
    addHandler(el, event, code, null, true);

}

function genAssignmentCode(value, assignment) {
    const res = parseModel(value);
    if (res.key === null) {
        return `${value} =${assignment};`
    } else {
        return `$set(${res.exp},${res.key},${assignment})`
    }
}

// 处理m-model="obj.val"
// 暂不处理带[]的
function parseModel(val) {
    val = val.trim();
    let len = val.length;

    // 1. m-model = "name"
    // 2. m-model = "obj[name].age"
    // 3. m-model = "obj.name.age"
    if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
        let index = val.lastIndexOf('.');
        if (index > -1) {
            return {
                exp: val.slice(0, index),
                key: JSON.stringify(val.slice(index + 1))
            }
        } else {
            return {
                exp: val,
                key: null
            }
        }
    }
}