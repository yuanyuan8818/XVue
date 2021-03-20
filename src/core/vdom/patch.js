import { mountComponent } from "../instance/lifecycle"
import { VNodeFlags,ChildrenFlags } from "./vnode"
import {compareDoubleEnd} from './doubleEnd'
import {infernoDiff} from './infernoDiff'

const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;

export function patch(prevVNode, nextVNode, container){
    console.log("MMMMMMMMMMMMMMMMMMMMMMMMM",container);
    console.log("你到底更新不？？");
    const nextFlags = nextVNode.flags 
    const prevFlags = prevVNode.flags
  
    console.log("哪里走》》",prevFlags);
    console.log("哪里走》》",nextFlags);    
    // 新旧节点是同一种类型才进行比较，不是同一种类型直接替换
    if(prevFlags !== nextFlags){
        console.log(1111111)
        replaceVNode(prevVNode, nextVNode, container)
    }else if(nextFlags && VNodeFlags.ELEMENT){
        console.log(222222)
        patchElement(prevVNode,nextVNode,container)
    }else if(nextFlags & VNodeFlags.COMPONENT){
        console.log(3333333333)
        patchComponent(prevVNode,nextVNode,container)
    }else if(nextFlags & VNodeFlags.TEXT ){
        console.log(444444444)
        patchText(prevVNode, nextVNode)
    }else if(nextFlags & VNodeFlags.FRAGMENT){
        console.log(555555)
        patchFragment(prevVNode,nextVNode,container)
    }else if(nextFlags & VNodeFlags.PORTAL){
        console.log(66)
        patchPortal(prevVNode,nextVNode)
    }
    
    console.log("哪里走》》");
}

function replaceVNode(prevVNode,nextVNode,container){
    container.removeChild(prevVNode.el)
    mount(nextVNode,container)
}

/**
 * patch 文本节点
*/
function patchText(prevVNode,nextVNode){
    const el = (nextVNode.el = prevVNode.el)
    if(prevVNode.children !== nextVNode.children){
        el.nodeValue = nextVNode.children        
    }
}

/**
 * patch 元素节点
*/
function patchElement(prevVNode,nextVNode,container){
    // 如果新旧VNode描述的是不同标签，调用replaceVNode，新节点替换旧节点
    console.log("新旧；；；",prevVNode,nextVNode);
    if(prevVNode.tag !== nextVNode.tag){
        replaceVNode(prevVNode,nextVNode,container)
        return
    }
    
    const el = (nextVNode.el = prevVNode.el)
    
    const prevData = prevVNode.data 
    const nextData = nextVNode.data     

    
    // if(prevData == null && nextData == null  ){
    //     console.log("气死");
    //     return
    // }

    console.log("秒~~~啊~~~~·",nextData);

    // 新的VNodeData存在时才有必要更新
    if(nextData){
    
        for(let key in nextData){
            const prevValue = prevData[key]
            const nextValue = nextData[key]            
            patchData(el,key,prevValue,nextValue)
        }
    }else{
        //  没有VNodeData 说明旧的prevNodeData需要移除
        if(prevData){
            for(let key in prevVNode){
                const prevValue = prevData[key]
                patchData(el,key,prevValue,null)
            }
        }        
    }
    
    // 先看看子节点是傻子？
    if( typeof  prevVNode.children == 'string' && typeof nextVNode.children == 'string'){
        // 子节点都是文本~！！
        patchText(prevVNode,nextVNode)
        return
    }


    // 调用patchChildren 函数递归地更新子节点
    patchChildren(prevVNode.childFlags, // 旧的VNode 子节点的类型
                  nextVNode.childFlags, // 新的VNode子节点的类型
                  prevVNode.children,           // 旧的VNode子接待你
                  nextVNode.children,
                  el)

}

export function patchData(el,key,prevValue,nextValue){
    switch(key){
        case 'style':
            // 遍历新VNodeData中的style数据，将新的样式应用到元素
            for(let k in nextValue){
                el.style[k] = nextValue[k]
            }
            // 遍历旧prevValue中的style数据，将旧的样式中不存在于新样式的剔除
            for(let k in prevValue){
                if(nextValue == undefined){                    
                    el.style[k] = ''
                }else{
                    if( prevValue && !nextValue.hasOwnProperty(k)){
                        el.style[k] = ''
                    }
                }                
            }
            break
        case 'class': 
            el.className = nextValue
            break
        default: 
            if(key[0] === 'o' && key[1] == 'n'){
                el.addEventListener(key.slice(2),nextValue)
            }else if(domPropsRE.test(key)){
                /** Properties(DOM Prop) 和 Attributes
                 * 1. 标准属性，DOM prop 如 id <body id = 'page'></body>
                 * 可以通过 document.body.id来访问，也可以document.body[id] 直接设置
                 * 2. 非标属性，Attributes <body custom="val">
                 *  当尝试通过document.body.custom 访问不了
                */
                // 当作DOM Prop处理                                
                el[key] = nextVNode
            }else {
                // 当作Attr处理
                el.setAttribute(key,nextValue)                
            }        
        break
    }
}

export function patchChildren(prevChildFlags,nextChildFlags,prevChildren,nextChildren,container){
    
    console.log("prevChildFlags",prevChildFlags);
    console.log("nextChildFlags",nextChildFlags);
    switch(prevChildFlags){
        // 旧的children是单个子节点，会执行该case语句块
        case ChildrenFlags.SINGLE_VNODE: 
        console.log('旧的children是单个子节点，会执行该case语句块');      
            switch(nextChildFlags){
                // 新的children也是单个子节点
                case ChildrenFlags.SINGLE_VNODE:
                    // 此时prevChildren 和 nextChildren 都是VNode对象
                   
                    patch(prevChildren,nextChildren,container)
                    break                    
                // 新的children没有子节点
                case ChildrenFlags.NO_CHILDREN:
                    console.log(77777777);
                    container.removeChild(prevChildren.el)
                    break
                // 新的children有多个子节点                
                // default:                
                //     replaceVNode(prevChildren,nextChildren,container)
                //     break             
                // 新的children有多个子节点
                default:
                    // 移除旧的单个字节点
                    console.log(888888);
                    container.removeChild(prevChildren.el)
                    // 将新的多个子节点一一挂载到容器中
                    for(let i = 0; i < nextChildren.length; i++){
                        mount(nextChildren[i],container)
                    }
                    break
            }
            break
        // 旧的children没有子节点
        case ChildrenFlags.NO_CHILDREN:     
        console.log('旧的children没有子节点');       
            switch(nextChildFlags){
                // 新的children 有一个子节点
                case ChildrenFlags.SINGLE_VNODE:
                    mount(nextChildren,container)
                    break
                // 新的children也没有子节点，新旧都没有，啥也不用做    
                case ChildrenFlags.NO_CHILDREN:
                    break                    
                default:
                    for(let i = 0; i < nextChildren.length; i++){
                        mount(nextChildren[i],container)
                    }
                    break
            }
            break
        // 旧的children是多个子节点
        default:   
        console.log('旧的children是多个子节点0');
            switch(nextChildFlags){
                // 新的是单个子节点
                case ChildrenFlags.SINGLE_VNODE:
                    for(let i = 0; i < prevChildren.length; container){
                        container.removeChild(prevChildren[i].el)
                    }
                    mount(nextChildren,container)
                case ChildrenFlags.NO_CHILDREN:
                    for(let i = 0; i < prevChildren.length; container){
                        container.removeChild(prevChildren[i].el)
                    }
                    break
                default:
                    // 新的children是多个子节点，使用diff算法
                    // waiting to do         
                    // compareDoubleEnd(prevChildren,nextChildren,container)
                    infernoDiff(prevChildren,nextChildren,container)           
                    break                    
            }      
            break
    }
    
}

