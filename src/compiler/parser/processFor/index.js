import { extend } from '@/shared/util'
import {getAndRemoveAttr} from '../../helpers'

// \s匹配所有的空白符  ?: 匹配但不捕获 
// 匹配  v-for="(item,index) in Arr" 并捕获 (item,index) 和 Arr
export const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/
// v-for="(item,index,key) in Arr"   ?匹配前面的表达式 0次或1次
export const forIteratorRE = /,([^,\}\]]*)(?:([^,\}\]]*))?$/

const stripParensRE = /^\(|\)$/g

export function processFor(el){
    let exp 
    if( exp = getAndRemoveAttr(el,'v-for') ){
        const res = parseFor(exp)
        if(res){
            extend(el,res)
        }else{
            warn(`Invalid v-for expression: ${exp}`)
        }
    }
}

/**
 * eg: exp =  (item,index,key) in Arr 
 * 则 inMatch : ['(item,index,key) in Arr', '(item,index,key)', 'Arr']
 * 则 alias = item,index,key
 * 则 interactorMatch = [',index,key']
 * */
 export function parseFor(exp){
    const inMatch = exp.match(forAliasRE)
    if(!inMatch) return
    const res = {}
    res.for = inMatch[2].trim()
    const alias = inMatch[1].trim().replace(stripParensRE,'')    
    const iteractorMatch = alias.match(forIteratorRE)        
    if(iteractorMatch){
        res.alias = alias.replace(forIteratorRE,'').trim()   // res.alias = item
        res.iteractor1 = iteractorMatch[1].trim()
        if(iteractorMatch[2]){
            res.iteractor2 = iteractorMatch[2].trim()
        }
    }else{
        res.alias = alias
    }   
    return res 
}
