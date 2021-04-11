
## XVue 
以学习Vue源码为目的实现一个基于web平台的MVVM框架 

## 开始
```
npm install
npm run dev
```

## 文件目录
```
├── dist ---------------------------------- 构建后文件的输出目录
├── index.html ---------------------------- 应用案例
├── index.js ------------------------------ XVue入口文件
├── src 
│   ├── compiler -------------------------- 编译器代码的存放目录，将 template 编译为 render 函数
│   │   ├── codegen ----------------------- 生成代码字符串
│   │   ├── directives -------------------- 处理指令相关
│   │   ├── modules ----------------------- 处理特殊指令、class、style等
│   │   ├── parser ------------------------ 解析器代码
│   ├── core ------------------------------ 存放通用的，与平台无关的代码
│   │   ├── observer ---------------------- 响应系统，包含数据观测的核心代码
│   │   ├── vdom -------------------------- 包含虚拟DOM创建(creation)和打补丁(patching)的代码
│   │   ├── instance ---------------------- 包含Vue构造函数设计相关的代码
│   ├── shared ---------------------------- 包含整个代码库通用的代码
├── package.json -------------------------- 
├── .gitignore ---------------------------- git 忽略配置
├── config.js ------------------------- 生成rollup配置的文件
```

## VNode设计
```
let vnode = {
        _isVNode: true,
        flags,
        tag,
        // VnodeData
        data,
        children,
        childFlags,
        el:null
    }    
```
给VNode添加flags 是Virtual DOM算法的优化手段之一, 在创建VNode时就把该VNode的类型通过flags标明。

#### VNode的flags类型：VNodeFlags
```
const VNodeFlags = {    
    ELEMENT_HTML: 1,    
    ELEMENT_SVG: 1 << 1,    
    COMPONENT_STATEFUL_NORMAL: 1 << 2,    
    COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,    
    COMPONENT_STATEFUL_KEPT_ALIVE: 1 << 4,    
    COMPONENT_FUNCTIONAL: 1 << 5,    
    TEXT: 1 << 6
}
//html 和 svg都是标签元素，都可以用ELMENT标识
VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG
// 有状态组件： 普通有状态组件, 需要被keepAlive和已经被keptAlive的组件
VNodeFlags.COMPONENT_STATEFUL = VNodeFlags.COMPONENT_STATEFUL_NORMAL 
                                | VNodeFlags.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE
                                | VNodeFlags.COMPONENT_STATEFUL_KEPT_ALIVE 
// 有条件组件和函数式组件都是组件
VNodeFlags.COMPONENT = VNodeFlags.COMPONENT_STATEFUL | VNodeFlags.COMPONENT_FUNCTIONAL
```
#### children的flags类型: ChildrenFlags
```
const ChildrenFlags = {
    // 未知的children类型
    UNKNOWN_CHILDREN: 0,
    // 没有children
    NO_CHILDREN: 1,
    // children是单个VNode
    SINGLE_VNODE: 1<<1,

    //children是拥有多个key的VNode
    KEYED_VNODES: 1<< 2,
    // children是没有key的VNode
    NONE_KEYED_VNODES: 1<<3
}

ChildrenFlags.MULTIPLE_VNODES = ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES
```

## 渲染器
将Virtual DOM渲染成特定平台下的真实DOM。包括mount 和 patch两个阶段。
首次渲染直接将VNode挂载到页面上，这叫mount; 如果旧的VNode存在，则会使用新的VNode 与旧的Vnode
进行对比，视图以最小的资源开销完成DOM的更新，这个过程是path。

### patch
patch只会发生在同类型的VNode上，否则直接替换。
如果新旧Vnode描述的是相同标签，则可进行patch，更新其VNodeData和Children。

更新VnodeData: patchData;
更新children: patchChildren; 

对比新旧子节点需分情况讨论(diff算法)：
1. 旧节点只有一个子节点
    - 1.1 新节点只有一个子节点 
    ```javascript
    // 递归地patch两个新旧子节点
     patch(prevChildren, nextChildren, container) 
    ```
    - 1.2 新节点没有子节点
    ```javascript
    // 移除旧节点的子节点
     container.removeChild(prevChildren.el) 
    ```
    - 1.3 新节点有多个子节点
    ```javascript
    containder.removeChild(prevChildren.el)
    for(let i = 0; i < nextChlidren.length; i++>){
        mount(nextChildren[i],container)
    }
    ```

2. 旧节点没有子节点
    - 2.1 新节点只有一个子节点
    - 2.2 新节点没有子节点
    - 2.3 新节点有多个子节点
    

3. 旧节点有多个子节点
    - 3.1 新节点只有一个子节点
    - 3.2 新节点没有子节点
    - 3.3 新节点有多个子节点
    ``` 核心diff算法```    


#### 核心的Diff算法
首先去除相同的前缀和后缀, 对于中间的children，首先判断是否需要移动(借助keyIndex判断)，接着再通过求解最长递增子序列尽可能少地移动节点

source: 用来存储新children中的节点在旧children中的位置
keyIndex: 索引表, 键: 新节点的key, 值: 新节点的位置索引


## 参考文献
[Vue技术内幕](http://caibaojian.com/vue-design/art/)
[渲染器](http://hcysun.me/vue-design/zh/renderer-diff.html#%E5%88%A4%E6%96%AD%E6%98%AF%E5%90%A6%E9%9C%80%E8%A6%81%E8%BF%9B%E8%A1%8C-dom-%E7%A7%BB%E5%8A%A8)