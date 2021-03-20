import {isPrimitive} from '@/shared/util'

export function createElement(context,tag,data,children,normalizationType,alwaysNormalize){
    if(Array.isArray(data) || isPrimitive(data)){
        normalizationType = children
        children = data 
        data = undefined
    }
}