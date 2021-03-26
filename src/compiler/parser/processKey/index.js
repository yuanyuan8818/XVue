
import { getBindingAttr } from "../../helpers";


export function processKey(el){
    const exp = getBindingAttr(el,'key')    
    if(exp){
        if(el.tag == 'template'){
            warn(`<template> cannot be keyed.Place the key on real elements instead.`)
        }
        if(el.for){
            const iterator = el.iterator2 || el.iterator1 
            const parent = el.parent
            if(iterator && iterator == exp && parent && parent.tag == 'transition-group'){
                warn(`Do not use v-for index as key on <transition-group> children,`)
            }
        }            
        el.key = exp
    } 
}