
// createCompier = _Creator(baseCompile)
// baseCompile的返回值 {ast,render}
/**
 * baseCompile，基础编译器，我们为了特定平台设计的编译器
 * baseCompile 输入template, 输出{ast, render}
 *  */ 
 export function createCompilerCreator(baseCompile){
    return function createCompier(baseOptions){
        function compile(template, options){          
            const finalOptions = Object.create(baseOptions) 
            const errors = []
            const tips = []
            
            let warn = (msg,range,tip)=>{
                (tip? tips: errors).push(msg)
            }                                    

            if(options){
                // merge custom moudles
                if(options.modules){
                    finalOptions.modules = (baseOptions.modules || []).concat(options.modules)
                }

                //copy other options
                for(const key in options){
                    if(key !== 'modules' && key !== 'directives'){
                        finalOptions[key] = options[key]
                    }
                }
            }

            finalOptions.warn = warn    
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


/**
 * compile 就是注入了finalOptions参数的 baseCompile 
 *  本质还是 baseCompile 编译器
*/
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
        // res.render = createFunction(compiled.render,fnGenErrors)                
        res.render = compiled.render        
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