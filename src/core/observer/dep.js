
import {remove} from '@/util/index.js'

let uid = 0

export default class Dep{
    constructor(){        
        this.id = uid++
        this.subs = []
    }

    depend(){
        if(Dep.target){
            Dep.target.addDep(this)
        }
    }

    notify(){
        const subs = this.subs.slice()
        for(let i = 0, l = subs.length; i<l; i++){
            // subs中收集的是观察者实例
            subs[i].update()
        }
    }

    addSub(sub){
        this.subs.push(sub)
    }
    removeSub(sub){
        remove(this.subs,sub)        
    }
    
 
}

Dep.target = null
const targetStack = []

export function pushTarget(_target){
    if(Dep.target){
        targetStack.push(Dep.target)
    }
    Dep.target = _target
}

export function popTarget(){
    Dep.target = targetStack.pop()
}