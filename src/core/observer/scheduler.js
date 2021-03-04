
import {nextTick} from '../util/next-tick.js'

const queue = []
let has = {}
let flushing = false
let waiting = false
let index = 0

function flushSchedulerQueue(){
    flushing = true
    let watcher, id
    
    // Sort queue before flush
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
    queue.sort((a,b)=> a.id - b.id)
    
    for(index = 0; index < queue.length; index++){
        watcher = queue[index]
        id = watcher.id
        has[id] = null
        watcher.run()
    }

}

// queue中的所有观察者会在突变完成之后同一执行更新
export function queueWatcher(watcher){
    const id = watcher.id
    // has[id] 用来避免重复入队的
    if(has[id] == null){
        has[id] = true
        if(!flushing){
            //将观察放入队列中
            queue.push(watcher)
        }else{
            // if already flushing, splice the watcher based on its id
            // if already past its id, it will be run next immediately
            let i = queue.length -1 
        }

        // queue the flush 
        if(!waiting){
            waiting = true
            // if( !config.async){
                //  同步执行
            //     flushSchedulerQueue()   
            // }            
            nextTick(flushSchedulerQueue)       
        }
        
    }
}