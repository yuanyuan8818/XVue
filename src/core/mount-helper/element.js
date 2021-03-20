
import {ChildrenFlags} from '@/core/vdom/vnode'
import { mount } from "../instance/render";

const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;
export function mountElement(vnode,container,refVNode){
    const el = document.createElement(vnode.tag)        
    vnode.el = el
    // 将vnodeData应用到元素上        
    const data = vnode.data.attrs || vnode.data 
    console.log("====^^^^^^^^^^^^^^==========^^^^^^^^^^^^^======",vnode.data);
    if(data){        
        for(let key in data){
            // key可能是calss style on 等等            
            switch(key){
                case 'style':                    
                    el.style = data.style
                    break
                case 'class': 
                    el.className = data[key]
                    break
                default:                
                    if(key[0] === 'o' && key[1] == 'n'){
                        el.addEventListener(key.slice(2),data[key])

                        if(key === 'on'){
                            let events = data[key]                            
                            for(let name in events){            
                                console.log("难道你没有改变吗？？？？？？？？？？？？？？",el);                                                    
                                el.addEventListener(name,events[name])
                            }
                        }
                    }else if(domPropsRE.test(key)){
                        /** Properties(DOM Prop) 和 Attributes
                         * 1. 标准属性，DOM prop 如 id <body id = 'page'></body>
                         * 可以通过 document.body.id来访问，也可以document.body[id] 直接设置
                         * 2. 非标属性，Attributes <body custom="val">
                         *  当尝试通过document.body.custom 访问不了
                        */
                        // 当作DOM Prop处理
                        console.log("DOM Prop:::::::::::::::::",key);                                
                        el[key] = nextVNode
                    }else {
                        // 当作Attr处理
                        if(key === 'domProps'){
                            let item = data[key]
                            console.log(" 瞧一瞧",item);
                            for(let it in item){
                                el[it] = item[it]
                            }
                        }
                        console.log("    Attr ::::::::::: ",key);                                 
                        // el.setAttribute(key,data[key])                
                    }        
                    break
            }
        }
    }
    // 递归地挂载子节点
    const childFlags = vnode.childFlags
    const children = vnode.children
    if(childFlags !== ChildrenFlags.NO_CHILDREN){
        if(childFlags & ChildrenFlags.SINGLE_VNODE){
            // 单个子节点，直接mout
            mount(children,el)
        }else if(childFlags & ChildrenFlags.MULTIPLE_VNODES){            
            for(let i = 0; i < vnode.children.length; i++){
                mount(children[i],el)
            }            
        }
    }        
    console.log("=====你在这里调用了？？？？？=====",container);
    refVNode ? container.insertBefore(el,refVNode) : container.appendChild(el)
}