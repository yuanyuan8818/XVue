

const callbacks = []
let pending = false

function flushCallbacks(){
    pending = false
    const copies = callbacks.slice(0)   
    callbacks.length = 0
    for(let i = 0; i< copies.length; i++){
        copies[i]()
    }
}

let timerFunc

// we'd better use micro tasks
// if promise is not supported, use marco task instead
if(typeof Promise !== 'undefined' ){
    const p = Promise.resolve()
    timerFunc = () =>{
        p.then(flushCallbacks)
    }

}else{
    // fallback to macro
    timerFunc = ()=>{
        setTimeout(flushCallbacks,0)
    }
}

export function nextTick(cb,ctx){
    let _resolve

    callHook.push(()=>{
        try{
            cb.call(ctx)
        } catch(e){
            handleError(e,ctx, 'nextTick')
        }        
    })

    if(!pending){
        pending = true
        timerFunc()
    }
     
}


