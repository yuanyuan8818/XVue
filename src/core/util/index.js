
// can we use __proto__?
export const hasProto = '__proto__' in {}

export function warn(msg,vm){
    console.error(`[XVue warn]: ${msg}`,warn)
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn(obj,key){
    return hasOwnProperty.call(obj,key)
}

export function isObject (obj) {
    return obj !== null && typeof obj === 'object'
}

export function isPlainObject (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}
/**
 * Define a property.
 */
export function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    })
  }
  
export function remove(arr,item){
    if(arr.length){
        let index = arr.indexOf(item)
        if(index > -1){
            return arr.slice(index,1)
        }        
    }
}