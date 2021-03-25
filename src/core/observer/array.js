import {def} from '../util/index'

const mutationMethods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]

export const arrayMethods = Object.create(Array.prototype)

// 重写数组的方法，缓存原来的方法，在内部调用
mutationMethods.forEach(method =>{
    def(arrayMethods,method,function mutator(...args){
        const value = Array.prototype[method].apply(this,args)
        let ob = __ob__
        let inserted 
        switch (method) {
            case 'push':            
            case 'push':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)        
            default:
                break;
        }
        if(inserted) ob.observeArray(inserted)
        ob.dep.notify()

        return value
    },false)
})






