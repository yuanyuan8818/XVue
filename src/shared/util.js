
export const no = () => false
export const isBuiltInTag = makeMap('slot,component',true)
/**
 * Make a map and return a function for checking if 
 * a key is in that map.
 */

export function makeMap(str,expectsLowerCase){
    const map = Object.create(null)
    const list = str.split(',')
    for(let i = 0; i<list.length; i++){
        map[list[i]] = true
    }  
    return expectsLowerCase? val =>map[val.toLowerCase()]: val=>map[val]
  }

    /**
 * Create a cached version of a pure function
 * 为一个纯函数创建一个缓存版本的函数
 * 纯函数： 输入不变则输出不变
 */
export function cached(fn){
    const cache = Object.create(null)    
    return (function cachedFn(str){
        const hit = cache[str]
        return hit || (cache[str] = fn(str))
    })
}

export function toString(val) {
    console.log("我看一下啊====================",val);
    return val == null ?
        '' :
        typeof val === 'object' ?
        JSON.stringify(val, null, 2) :
        String(val)
}