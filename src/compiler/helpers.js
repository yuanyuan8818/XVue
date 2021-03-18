import {parseFilters} from './parser/filter-parser'
import {emptyObject} from '@/shared/util'
export function getAndRemoveAttr(el,name,removeFromMap){    
    let val     
    /**
     * 
     * undefined == null 为true          
     */
    // console.log("查看 v-else",name);
    // console.log("妈咪妈咪轰",el.attrsMap[name]);
    if((val = el.attrsMap[name]) != null){
        // console.log("jejejda =======",val);
        const list = el.attrsList
        for(let i = 0, l = list.length; i <l; i++){
            if(list[i].name === name){                
                /**
                 * splice()从数组中 添加/删除 项目，然后返回被删除的项目。改变原数组
                 */
                list.splice(i,1)                
                break
            }            
        }        
    }
    if(removeFromMap){
        delete el.attrsMap[name]
    }
    /**返回该属性name 对应的 value */
    return val
}

export function getBindingAttr(el,name,getStatic){
    // console.log("平平无奇仙女生日---",el,name);
    const dynamicValue = getAndRemoveAttr(el,':' + name) || getAndRemoveAttr(el,'v-bind:'+name)
    // console.log("&这到底有啥区别呢/。?&",dynamicValue);
    if(dynamicValue!=null){
        // :key 或者v-bind:key 存在    
        return parseFilters(dynamicValue)
    }else if(getStatic !== false){
        //进入此说明绑定属性值失败 el上不存在key属性值
        // :key 或者v-bind不存在时 dynamicValue 是undefined，进入这里
        //当第三个参数不传递时, 默认该elseif存在
        const staticValue = getAndRemoveAttr(el, name)
        // console.log("&这到底有啥区别呢/。?&---staticValue-----",staticValue);
        if(staticValue !=null){
            //返回 非绑定属性值请用JSON.stringigy
            return JSON.stringify(staticValue)
        }
    }
}

export function addHandler(el,name,value,modifiers,important,warn,range,dynamic){
    modifiers = modifiers || emptyObject
    modifiers = modifiers || emptyObject
    if(modifiers.capture){
        delete modifiers.capture
        name = '!' + name
    }
    if(modifiers.once){
        delete modifiers.once
        name = '~' + name
    }
    if(modifiers.passive){
        delete modifiers.passive
        name = '&' + name
    }
    if(name === 'click'){
        if(modifiers.right){  // right修饰符标识右击
            name = 'contextmenu'  // 右击会触发contextmenu事件 弹出一个菜单
            delete modifiers.right
        }else if(modifiers.middle){  // middle 滚轮事件
            name = 'mouseup'
            delete 'mouseup'
        }
    }

    let events
    if (modifiers.native) {
        delete modifiers.native
        events = el.nativeEvents || (el.nativeEvents = {})
    } else {
        events = el.events || (el.events = {})
    }

    const newHandler = {value}
    if(modifiers !== emptyObject){
        newHandler.modifiers = modifiers
    }

    const handlers = events[name]
    if(Array.isArray(handlers)){

    }else if(handlers){

    }else{
        events[name] = newHandler
    }




}

export function addRawAttr(el,name,value,range){
    el.attrsMap[name] = value
    el.attrsList.push({name,value})
}

export function pluckModuleFunction(modules,key){    
    return modules? modules.map(m=>m[key]).filter(_=>_):[]
}

export function baseWarn(msg,rang){
    console.error(`[Vue compiler]: ${msg}`)
}

export function addDirective(el,name,rawName,value,arg,modifiers){
    console.log("el.directives.........指令---",el);
    (el.directives || (el.directives = [])).push({name,rawName,value,arg,modifiers})
    el.plain = false
}

export function addProp (el, name, value, range, dynamic) {
    (el.props || (el.props = [])).push({ name, value, dynamic })
    el.plain = false
  }