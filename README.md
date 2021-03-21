
## XVue 
以学习Vue源码为目的的一个MVVM框架 

## 文件目录
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



## 参考文献
Vue技术内幕
渲染器 