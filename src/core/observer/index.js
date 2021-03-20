

import {hasOwn,
    isPlainObject,
    def,
    isObject
   } from '@/core/util/index'    
// import {Dep} from './dep.js'          
import Dep from './dep.js'          

export class Observer{    
constructor(value){
    this.value = value        
    this.dep = new Dep()              
    def(value,'__ob__',this)        
    if(Array.isArray(value)){
        const augment = protoAugment
        augment(value,arrayMethods,arrayKeys)
        // 使嵌套的数据也是响应式的
        this.observeArray(value)
    }else{        
        this.walk(value)
    }
}
/**
 * 遍历obj, 给每个属性都设置响应式
 * @param {*} obj 
 */
walk(obj){
    const keys = Object.keys(obj)
    for(let i = 0; i< keys.length; i++){
        defineReactive(obj,keys[i],obj[keys[i]])
    }
}    
observeArray(array){
    for(let i = 0, l = array.length; i< l; i++){
        observe(array[i])
    }
}
}

function protoAugment(target,src,key){
target.__proto__ = src
}

export function observe(value){        
// if(!isObject(value) || value instanceof VNode){
//     return 
// }    
    let ob
    if(hasOwn(value,'__ob__') && value.__ob__ instanceof Oberserver){
        ob = value.__ob__
    }else if( Array.isArray(value) || isPlainObject(value)&& !value._isVue){                
        try{
            ob = new Observer(value)
        }catch(e){
            console.error('[XVue: ] Observer error')
        }
        
    }    
    return ob
}


export function defineReactive(obj,key,val){
    const dep = new Dep()

    // 默认深度观测
    let childOb = observe(val)    
    let value = val
    Object.defineProperty(obj,key,{
        enumerable: true,
        configurable: true,
        get: function reactiveGetter(){
            // const value = getter? getter.call(obj): val
            if(Dep.target){   
                console.log("____get ???????????",value);             
                dep.depend()
                if(childOb){
                    /**
                     * 假设 childOb = observe(a)
                     * childOb = a.__ob__
                     * 则以下 a.__ob__.dep.depend                     
                    */
                    childOb.dep.depend()
                    // 数组的索引不是响应式的，需要为子元素手动收集依赖
                    if(Array.isArray(value)){
                        dependArray(value)
                    }
                }                
            }
            return value
        },
        set: function reactiveSetter(newVal){
            // const value = getter? getter.call(obj): val
            if(newVal == value){
                return
            }        
            value = newVal                              
            childOb = observe(newVal)
            dep.notify()
        }
    })
}

/**
* Collect dependencies on array elements when the array
*  is touched, since we cannpt intercept array element access
* lick proerty getters.
*/
function dependArray(value){
    for(let e, i = 0, l = value.length; i<l; i++){
        e = value[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if(Array.isArray(e)){
            dependArray(e)
        }
    }
}