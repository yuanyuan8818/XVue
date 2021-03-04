

// 数据代理  this.example  即是访问 this._data.example
export function proxy(vm, target, key){    
    Object.defineProperty(vm, key,{
        get(){
            return vm[target][key]
        },
        set(val){
            vm[target][key] = val
        }
    })    
}
// export function proxy(target, sourceKey, key) {
//     sharedPropertyDefinition.get = function proxyGetter() {
//         return target[sourceKey][key];
//     }
//     sharedPropertyDefinition.set = function proxySetter(newVal) {
//         return target[sourceKey][key] = newVal;
//     }
//     Object.defineProperty(target, key, sharedPropertyDefinition);
// }