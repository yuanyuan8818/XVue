

// export function genHandlers(events,isNative){
//     const prefix = isNative ? 'nativeOn:' : 'on:'
//     let staticHandlers = ``
//     let dynamicHandlers = ``
    
//     for(const name in events){
//         const handlerCode = genHandler(events[name])
//         if(events[name] && events[name].dynamic){
//             dynamicHandlers += `${name},${handlerCode},`
//         }else{
//             staticHandlers += `"${name}":${handlerCode},`
//         }
//     }
//     return res.slice(0, -1) + '}'
// }

// /**
//  * el.events = { input:{ value: "name = $event.target.value"} }
//  * 
// */
// function genHandler(handler){
//     if(!handler){
//         return 'function(){}'
//     }

//     if(Array.isArray(handler)){
//         return `[${handler.map(handler => genHandler(handler)).join(',')}]`
//     }


// }


export function genHandlers(events){
    console.log("=====genHandlers=====",events);    
    var res = 'on:{';
    for(var name in events){        
        res += "\'" + name + "\':" + 
              ("function($event){  console.log(' input数据变更 ',$event); "
                +  `${events[name].value}` + ";}") + '.'
    }

    console.log("_________res______________",res);    
    return res.slice(0,-1) + '}'
}