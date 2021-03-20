import { mountComponent } from "../instance/lifecycle"
import { patch } from "./patch"



export function infernoDiff(prevChildren,nextChildren,container){
    let j = 0
    let prevEnd 
    let nextEnd
    console.log("庙里个喵喵*********-----",prevChildren.length);
    console.log("啷里格-----",prevChildren);
    outer:{
        while(j<prevChildren.length && j < nextChildren.length){
            if(prevChildren[j].key == nextChildren[j].key){
                patch(prevChildren[j],nextChildren[j],container)
                j++
            }else{
                break
            }
            if(j >= nextChildren.length || j >= prevChildren.length){
                break outer
            }
        }
    
        
        prevEnd = prevChildren.length - 1
        nextEnd = nextChildren.length - 1
        while(prevEnd > 0 && nextEnd > 0){
            if(prevChildren[prevEnd].key == nextChildren[nextEnd].key){
                patch(prevChildren[prevEnd],nextChildren[nextEnd],container)
                prevEnd--
                nextEnd--
            }else{
                break
            }
            if(j >= nextChildren.length || j >= prevChildren.length){
                break outer
            }        
        }        
    }   

    if(j>prevEnd && j<= nextEnd){
        // 旧节点先遍历完，新节点还有剩余,需挂载剩余的新节点
        for(let i = j; i <= nextEnd; i++){
            mount(nextChildren[i],container,nextChildren[prevEnd+1].el)
        }
    }else if(j > nextEnd){
        // 新节点先遍历完，需删除多余的旧节点
        for(let i = j; i <=prevEnd; i++){
            container.removeChild(prevChildren[i].el)
        }
    }else{
        let source = []
        // 新旧节点都没遍历完。需要移动节点
        for(let i = j; i <= nextEnd - j +1; i++){
            source.push(-1)
        }

        let prevStart = j
        let nextStart = j 

        let moved = false
        let pos = 0

        let patched = 0

        // 构建索引表
        const keyIndex = {}
        for(let i = nextStart; i <= nextEnd; i++){
            keyIndex[nextChildren[i].key] = i
        }

        //遍历旧children的剩余未处理节点
        let prevVnode
        for(let i = prevStart; i <= prevEnd; i++){
            prevVnode = prevChildren[i]
            if(patched < nextEnd - j + 1){
                //已经更新的节点数 小于 新节点剩余数目
                const k = keyIndex[prevVnode.key] 
                if(k != undefined){
                    patch(prevVnode,nextChildren[k],container)
                    patched++
                    source[k-nextStart] = i
                    if(k < pos){
                        // 移动
                        moved = true                        
                    }else{
                        pos = k
                    }
                }else{
                    // 不存在
                    container.removeChild(prevVnode.el)
                }

            }else{
                // patched == nextEnd -j + 1 旧节点剩余的应该移除
                container.removeChild(prevVnode.el)
            }            
        }   

        if(moved){
            const seq = lis(source)
            // j指向最长递增子序列的最后一个值
            let j = seq.length -1
            // 遍历source 判断哪些节点需要移动
            for(let i = source.length - 1; i >=0; i-- ){
                if(source[i] == -1){
                    // 新节点，需要挂载
                    let pos = i + nextStart                     
                    let nextPos = pos + 1
                    mount( nextChildren[pos],container, nextPos < nextChildren.length ? nextChildren[nextPos].el : null)
                }else{
                    //在旧节点中存在，
                    // 通过lis 尽可能减少移动
                    if(seq[j] === i){
                        // 不需要移动
                        j--
                    }else{
                        // seq[j]!== i  需要移动，该怎么移动？
                        // 这里处理的是剩余的新节点，并且真实的dom最后应该是按新节点顺序挂载
                        let pos = i + nextStart                        
                        let nextPos = pos + 1
                        container.insertBefore(nextChildren[pos],nextPos < nextChildren.length?nextChildren[nextPos] : null)
                    }
                    
                }
            }
        }

    }   
}

// 最长递增子序列
function lis(source){
    const lisArr = new Array(source.length).fill(1)
    // [0,8,4,12,2,10]
    for(let i = source.length -2; i >=0; i--){
        let max = 1
        for(let j = i +1; j < source.length; j++){
            if(source[i] < source[j]){
                let tmp = lisArr[i] + lisArr[j]
                if(tmp > max){
                    max = tmp
                }
            }
        }        
        if(max > lisArr[i]){
            lisArr[i] = max
        }
    }    
    
    let seq = []
    let maxValue = Math.max.apply(null,lisArr)
    while(maxValue >=1){
        let idx = lisArr.findIndex(item=> item == maxValue)
        seq.push(idx)
        maxValue--
    }
    return seq
}