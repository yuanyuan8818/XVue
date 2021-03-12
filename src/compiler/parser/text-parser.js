import { cached } from '@/shared/util'
import { parseFilters } from "./filter-parser"

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g

const buildRegex = cached(delimiters =>{
    const open = delimiters[0].replace(regexEscapeRE, '\\$&')
})

export function parseText(text,delimiters){
    const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
    if(!tagRE.test(text)){
        return 
    }

    const tokens = []
    const rawTokens = []
    let lastIndex = tagRE.lastIndex = 0
    let match,index,tokenValue
    /**
     *  eg: text = '我的名字{{name}},请多多指教'
    */
    while((match = tagRE.exec(text))){
        // match = ["{{name}}", "name",index:4,input: '我的名字{{name}},我的年龄{{age}}']
        // 初始时 lastIndex 被设置为了0
        // match.index 匹配文本的第一个字符串的位置
        // 匹配一次成功后, RegExpObject的lastIndex会被设置到匹配文本的最后一个字符的下一个位置
        index = match.index
        if(index > lastIndex){
            // lastIndex 本次开始字符串开始的位置 （上一次匹配文本的最后一个字符的下一个位置）
            // index 是本轮已匹配成功的文本的第一个字符的位置
            // text.slice(lastIndex,index) 是纯文本
            rawTokens.push(tokenValue = text.slice(lastIndex,index))
            tokens.push(JSON.stringify(tokenValue))
        }
        const exp = parseFilters(match[1].trim())
        tokens.push(`_s(${exp})`)
        rawTokens.push({'@binding':exp})
        lastIndex = index + match[0].length
    }
    //text = '我的名字{{name}},请多多指教'
    // tagRE每次执行exec时，都会从tagRE.lastIndex位置开始陪陪，当tagRE.lastIndex指向“,”
    // match返回null 跳出while循环。 但此时lastIndex= 12  text.length = 18
    if(lastIndex < text.length){
        // 处理最后剩余的纯文本
        rawTokens.push(tokenValue = text.slice(lastIndex))
        tokens.push(JSON.stringify(tokenValue))
    }

    return {
        expression: tokens.join('+'),
        tokens: rawTokens
    }
    
}
