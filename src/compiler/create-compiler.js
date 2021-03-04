
// createCompier = _Creator(baseCompile)
// baseCompile的返回值 {ast,render}
export function createCompilerCreator(baseCompile){
    return function createCompier(baseOptions){
        function compile(template, options){            
            const compiled = baseCompile(template.trim(), finalOptions)   
            console.log("嘻嘻哈哈-----", compiled);              
            return compiled
        }
        return {
            compile,
            compileToFunction: createCompileToFunctionFn(compile)
        }
    }
}


function createCompileToFunctionFn(compile){        
    const cache = Object.create(null)

    // compileToFunctions生成的是真正可执行的代码
    return function compileToFunctions(template,options,vm){                
        // options = extend({},options)        
        // options = Object.create(options)              
        options = {}

        const key = template
        if(cache[key]){
            return cache[key]
        }

        const compiled = compile(template,options)  
                      
        const res = {}
        const fnGenErrors = []
        res.render = createFunction(compiled.render,fnGenErrors)                
        // console.log("看一下咯……………………………………………………………………",res.render);
        return (cache[key] = res)
    }
}

function createFunction(code,errors){
    try{
        return new Function(code)
    }catch(err){
        errors.push({err,code})
        return noop 
    }
}