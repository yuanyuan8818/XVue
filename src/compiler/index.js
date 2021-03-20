
import {createCompilerCreator} from './create-compiler'
import {baseOptions} from './options.js'
import {parse} from './parser/index'
import {optimize} from './optimizer'
import {generate} from './codegen/index'

// createCompier = _Creator(baseCompile)
// creatCompilerCreator根据baseCompile创建出不同平台编译器
export const createCompier = createCompilerCreator(function baseCompile(template,options){
    // 抽象语法树    
    const ast = parse(template.trim(), options)
    console.log("ast",ast);
    optimize(ast,options)
    const code = generate(ast,options)    
    return {
        ast,
        render: code.render,        
    }
})

// 执行createCompier 生产 compileToFunction等函数
// compile函数生成的是字符串形式的代码，compileToFunctions生成的是真正可执行的代码
const {compile, compileToFunction} = createCompier(baseOptions)

export {compile, compileToFunction}
