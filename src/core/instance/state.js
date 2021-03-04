
import {warn} from 'src/core/util'
import {hasOwn} from '@/core/util/index.js'
import {proxy} from './proxy'
import {observe} from '../observer/index'

export function initState(vm){
    vm._watchers = []
    const opts = vm.$options
    if(opts.props) initProps(vm,opts.props)
    // if(opts.methods) initMethods(vm,opts.methods)
    if(opts.data){
        initData(vm)
    }else{
        observe(vm._data = {}, tru)
    }
    if(opts.computed) initComputed(vm,opts.computed)
    if(opts.watch && opts.watch !== nativeWatch){
        initWatch(vm,opts.watch)
    }
}

function initData(vm){
    let data = vm.$options.data    
    data =  vm._data = typeof data == 'function' ? 
            getData(data,vm) : data || {}
    
    // proxy data on instance
    const keys = Object.keys(data)
    const props = vm.$options.props
    const methods = vm.$options.methods
    let i = keys.length
    while(i--){
        const key = keys[i]
        if(methods && hasOwn(methods,key)){
            warn(`Method "${key}" has already been defined as a data property`,vm)
        }
        if(props && hasOwn(props,key)){
            warn(`The data property "${key}" is already declared as a pro` 
             + `Use prop default value instand`,vm)
        }else{            
            proxy(vm,`_data`,key)
        }
    }    
    observe(data,true)                    
}

export function getData(data,vm){
    try{
        return data.call(vm)
    }catch(e){
        console.error(e,vm,`data()`)
        return {}
    }
}