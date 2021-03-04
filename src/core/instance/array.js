
import {def} from '../util/index'

const arrayProto = Array.prototype
// arrayMethods.__proto__ = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ]

  methodsToPatch.forEach(function (method){
      // cache original method
    const original = arrayProto[method]
    def(arrayMethods, method, function mutator(...args){
        const result = original.apply(this,args)
        const ob = this.__ob__
        let inserted
        switch (method) {
            case 'push':                                
            case 'shift': 
                inserted = args
                break;
            case 'slice':
                inserted = args.slice(2)                
            default:
                break;
        }
        if(inserted){
            ob.observeArray(inserted);
        }
        ob.dep.notify()
        return result
    })
  })