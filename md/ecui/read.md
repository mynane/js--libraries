#ecui(jingoal)
这是今目标科技有限公司使用的一套MVC前端框架，主要由四大模块组成：
- [基本的DOM操作方法](doc/ecui-dom.html)
- [路由模块](doc/route.html)
- [指令模块](doc/control.html)
- [模板引擎](doc/etpl.html)

###**整体概述**
ecui主要有6大功能区域+独立的模板引擎
>1.浏览器检测
```javascript
ecui.browser
```
>2.dom操作
```javascript
ecui.dom
```
>3.ext
```javascript
ecui.ext
```
>4.io操作
```javascript
ecui.io
```
>5.ui指令
```javacript
ecui.ui
```
>6.util
```javascript
ecui.util
```

####ecui.browser
>`firefoxversion`  火狐的版本    
>`ieVersion` IE的版本  
>`isStrict` 是否是严格模式  
>`isWebkit` 是否webkit内核浏览器
>`operaVersion` Opera浏览器版本