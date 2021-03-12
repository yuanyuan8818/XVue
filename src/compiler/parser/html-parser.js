import { makeMap } from '@/shared/util'
import { isUnaryTag } from '../options'

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being pased as HTML comment when inlined in page
const comment = /^<!\--/

export const isPlainTextElement = makeMap('script,style,textarea', true)
export function parseHTML(html,options){
    const stack = []
    const expectHTML = options.expectHTML
    let index = 0
    let last,lastTag
    
    console.log("会从这里开始吗=========",html);
    while(html){

        if(!lastTag || !isPlainTextElement(lastTag)){
            let textEnd = html.indexOf('<')

            if(textEnd == 0){
                /** 1. <!--注释-->
                 *  2. <div> 开始标签的开始部分</div>  ---- <div>
                 *  3. <div> 开始标签的结束部分</div>  ---- </div>
                 *  4. <absdc  纯文本
                */
               
               if(comment.test(html)){
                   // 可能是注释节点
                    const commentEnd = html.indexOf('-->')
                    options.comment(html.substring(4,commentEnd))  // 截取注释的内容
                    advance(commentEnd + 3)
                    continue
               }

               /**
                * 开始标签要求： 1、 匹配到 <tag>  (如果是 <tag 则不行)
                *               2\ <tag attribute>
               */
                const startTagMatch = parseStartTag()                
                if(startTagMatch){
                    handleStartTag(startTagMatch)                    
                    continue                    
                }
                           
                // 结束标签
                const endTagMatch = html.match(endTag)
                if(endTagMatch){
                    const curIndex = index                    
                    advance(endTagMatch[0].length)                    
                    parseEndTag(endTagMatch[1],curIndex,index)
                    continue

                }               
            }

            // =0 <2sfd3
            let text,rest,next
            if(textEnd >= 0){
                rest = html.slice(textEnd)
                while (
                    !endTag.test(rest) &&
                    !startTagOpen.test(rest) &&
                    !comment.test(rest)
                ) {
                    next = rest.indexOf('<',1)
                    if(next < 0) break                    
                    textEnd += next
                    rest = html.slice(textEnd)                    
                }
                text = html.substring(0,textEnd)
                advance(textEnd)
            }

            if(textEnd <0){
                text = html
                html = ''
            }

            if(options.chars && text){                
                options.chars(text)
            }

            if(!stack.length && options.warn){
                options.warn(`Mal-formatted tag at end of template: "${html}"`)
            }

        }else{
            // <script> <style> <textarea> 纯文本
            let endTagLength = 0
            const stackedTag = lastTag.toLowerCased()
            /** 当stackedTag = textarea时
             *  resStacked的作用是用来匹配纯文本标签内容及结束标签的 xxxxx</textarea>
            */
            const reStackedTag = reCache[stackedTag] 
                        || ( reCache[stackedTag] = new RegExp('([\\s\\S]*?)(<?' + stackedTag + '[^>]*>)','i')  )
            const rest = html.replace(reStackedTag,function(all,text,endTag){
                /** all: 陪陪到的字符串
                *  text: 匹配到的第一个子分组
                *  eg:xxxxx</textarea> 则 text就是xxxx; endTag就是 </textarea>
                */
               endTagLength = endTag.length
               if(options.chars){
                    options.chars(text)
                }
                return ''
            })           
            index += html.length - rest.length     
            html = rest
            parseEndTag(stackedTag,index-endTagLength,index) 
        }
        
    }

    function advance(n){
        index += n
        html = html.substring(n)
    }

    function parseStartTag(){
        let start = html.match(startTagOpen)  // 匹配开始标签的开始部分
        if(start){
            // 匹配到了 <tag   可能是开始标签
            const match = {
                tagName: start[1],
                attrs: [],
                start: index
            }
            advance(start[0].length) // 截取<div
            let end, attr

            // 没有匹配到 /> 和 > 情况下，一直匹配属性
            while( !( end = html.match(startTagClose)) && (attr = html.match(attribute)) ){                
                 advance(attr[0].length)
                 match.attrs.push(attr)
            }            
            if(end){
                /**
                 * <div/>  end = ['/>', '>']
                 * <div >  end = ['>', undefined]
                */
               match.unarySlash = end[1]   // undefined说明是非一元标签
               advance(end[0].length)
               match.end = index  // 给match增加一个end属性                                          
               return match
            }

        }

    }

    function handleStartTag(match){
        /** 匹配到<div>或 <div/>
         * 
        */
        const tagName = match.tagName
        const unarySlash = match.unarySlash        

        const unary = isUnaryTag(tagName) || !!unarySlash

        const l = match.attrs.length
        const attrs = new Array(l)
        for(let i = 0; i<l; i++){
            const args = match.attrs[i]
            const value = args[3] || args[4] || args[5] || ''
            attrs[i] = {
                name: args[1],
                value: value
            }
        }

        if(!unary){
            stack.push({
                tag: tagName,
                lowerCasedTag: tagName.toLowerCase(),
                attrs: attrs
            })
            lastTag = tagName
        }

        if(options.start){
            options.start(tagName, attrs, unary, match.start, match.end)
        }

    }

    // 解析结束标签
    function parseEndTag(tagName,start,end){
        let pos, lowerCasedTagName
        if(start == null) start = index
        if(end == null) end = index
        
        if(tagName){
            lowerCasedTagName = tagName.toLowerCase()
        }

        //寻找当前解析的结束标签所对应的开始标签在stack栈中的位置
        if(tagName){
            for(pos = stack.length -1; pos > 0; pos--){
                if(stack[pos].lowerCasedTag == lowerCasedTagName){
                    break
                }
            }
        }else{
            pos = 0
        }

        if(pos >=0){
            for(let i = stack.length -1; i >=pos; i--){
                if(i > pos){
                    options.warn(`tag < ${stack[i].tag} > has no matching end tag.`)
                }
                if(options.end){
                    // options.end(stack[i].tag,start,end)
                    options.end()
                }
            }
            stack.length = pos
            lastTag = pos && stack[pos -1].tag            
        }else if(lowerCasedTagName == 'br'){
            if(options.start){
                options.start(tagName,[],false,start,end)
            }
        }else if(lowerCasedTagName === 'p'){
            if(options.start){
                options.start(tagName,[],false,start,end)
            }
            if(options.end){
                // options.end(tagName,start,end)
                options.end()
            }
        }
    }
}