
import {parsePath} from '@/core/util/lang.js'
import { isObject } from '../util/index.js'
import {pushTarget,popTarget} from './dep.js'
import {queueWatcher} from './scheduler.js'

let uid = 0
export default class Watcher{
    constructor(
        vm,
        expOrFn,
        cb,
        options,
        isRenderWatcher
    ){
        // 每个watcher实例都有一个vm，指向它对应的组件
        this.vm = vm
        if(isRenderWatcher){
            vm._watcher = this
        }else{
            vm._watchers.push(this)
        }
       
        this.expression = expOrFn.toString()

        if(options){
            this.deep = !!options.deep
            this.lazy = !!options.lazy
            this.computed = !!options.computed
            this.sync = !!options.sync
            this.before = !!options.before
        }

        this.cb = cb
        this.id = ++uid
        
        this.deps = []
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()
        
        if(typeof expOrFn == 'function'){
            this.getter = expOrFn
        }else{
            this.getter = parsePath(expOrFn)
        }

        this.value = this.get()
    }
    get(){
        pushTarget(this)
        let value
        const vm = this.vm        
        value = this.getter.call(vm,vm)

        popTarget()
        this.cleanupDeps()        
        
    }
    addDep(dep){
        const id = dep.id
        // 避免重复收集依赖
        if(!this.newDepIds.has(id)){
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if(!this.depIds.has(id)){
                dep.addSub(this)
            }
        }
    }
    update(){
         if(this.sync){
            // 是否进行同步更新
            this.run()
         }else{
            // 渲染函数的观察者将观察者对象放到一个异步更新队列中
             queueWatcher(this)
         }
    }
    run(){
        // 异步和同步都是通过调用run()进行更新变化
        const value = this.get()
        if(value !== this.value || isObject(value)){
            // set new value
            const oldValue = this.value
            this.value = value
            this.cb.call(this.vm, value, oldValue)
        }
    }    
    cleanupDeps(){
        let i = this.deps.length
        while(i--){
            const dep = this.deps[i]
            if(!this.newDepIds.has(dep.id)){
                dep.removeSub(this)
            }
        }
        let tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp 
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps // 总是保持上一次求值中收集的Dep实例对象

        this.newDeps = tmp   
        this.newDeps.length = 0
    }
}