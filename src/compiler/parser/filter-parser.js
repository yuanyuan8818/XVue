
const validDivisionCharRE = /[\w).+\-_$\]]/
/**
 * \w 匹配非特殊字符，即a-z, A-Z, 0-9, _, 汉字
 * \W 匹配特殊字符, 即非\w的其余的所有特殊字符 
 * 
 * validDivisionCharRE用来匹配一个字符
 */

export function parseFilters(exp){    
    let inSingle = false
    let inDouble = false
    let inTemplateString = false
    let inRegex = false
    let curly = 0
    let square = 0
    let paren = 0
    let lastFilterIndex = 0
    let c,prev,i,expression,filters 

    for(i=0; i<exp.length; i++){
        prev = c
        // charCodeAt()返回指定位置的字符的ASCII码
        c = exp.charCodeAt(i)
        if(inSingle){
            if(c === 0x27 && prev !== 0x5C) inSingle = false
        }else if(inDouble){
            if (c === 0x22 && prev !== 0x5C) inDouble = false
        }else if(inTemplateString){
            if (c === 0x60 && prev !== 0x5C) inTemplateString = false
        }else if(inRegex){
            //当前读取的字符存在于正则表达式内，已确定为正则环境
            if( c=== 0x2f && prev !== 0x5C) inRegex = false
        }else if(
            c === 0x7C && //pipe |
            exp.charCodeAt(i+1) !== 0x7C &&
            exp.charCodeAt(i-1) !== 0x7C &&
            !curly && !square && !paren
        ){
            if(expression === undefined){
                // i是当前遇到的管道符|的位置索引，
                lastFilterIndex = i+1  
                expression = exp.slice(0,i).trim()
            }else{
                pushFilter()
            }

        }else{
            switch(c){
                case 0x22: inDouble = true; break          // " 
                case 0x27: inSingle = true; break          // ' 单引
                case 0x60: inTemplateString = true; break  // ` 模板字符串的单引  `${{msg}}`
                case 0x28: paren++; break                  // ( 开括号
                case 0x29: paren--; break                  // ) 闭括号
                case 0x5B: square++; break                 // [ 开方括号
                case 0x5D: square--; break                 // ]
                case 0x7B: curly++; break                  // {
                case 0x7D: curly--; break                  // }
            }
            if(c === 0x2f){ // / 进入正则环境的代码
                let j = i-1
                let p 
                for(; j>=0; j--){
                    //charAt()返回指定位置的字符串
                    p = exp.charAt(j)
                    if(p !== ' ') break  //如果找到了 /字符之前不为空的字符 则break结束for循环
                }
                /**
                 * p不存在，或者字符串不满足正则validDivisionCharRE的情况下
                 * （/前面的字符不能是validDivisionCharRE所匹配的任何一个字符，否则/不会被认为是正则的开始）
                 * 认为 / 是正则的开始
                */
                if(!p || !validDivisionCharRE.test(p)){
                    inRegex = true
                }
            }
        }
    }

    if(expression === undefined){
        expression = exp.slice(0,i).trim()
    } else if(lastFilterIndex !== 0){
        pushFilter()
    }    

    function pushFilter(){
        //lastFilterIndex = i+1 是管道符|的后一个字符的位置
        (filters || (filters = [])).push(exp.slice(lastFilterIndex,i).trim())
        lastFilterIndex = i+1
    }

    if(filters){
        for( i =0; i<filters.length; i++){
            expression = wrapFilter(expression,filters)
        }
    }

    return expression

}

function wrapFilter(exp,filter){
    const i = filter.indexOf('(')
    if(i < 0){
        return `_f("${filter}")(${exp})`
    }else{
        const name = filter.slice(0,i)
        const args = filter.slice(i+1)
        return `_f("${name}")(${exp}${args !== ')' ? ',' + args: args})`
    }
}