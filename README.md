#**ETPL(Enterprise Template)**
* * *

ETPL是一个强复用、灵活、高性能的JavaScript模板引擎，适用于浏览器端或Node环境中视图的生成。
##**Start**
<br/>
ETpl可以在CommonJS/AMD的模块定义环境中使用，也能直接在页面下通过script标签引用。
###**浏览器环境**
<br/>
直接通过script标签引用，你可以获得一个全局的etpl变量
```javascript
  <script src="etpl.js"></script>
```
在AMD环境的模块定义时，你可以通过同步require获得ETpl模块
```javascript
  define(function (require) {
    var etpl = require('etpl');
  });
```
在AMD环境，你也可以通过异步require获得ETpl模块
```javascript
    require([ 'etpl' ], function (etpl) {
    });
```
###**Node.JS环境**
你可以通过npm来安装ETpl
```
  $ npm install etpl
```

###使用
使用ETPL模块，对模板源代码进行编译，会能得到编译后的function
```javascript
  var render = etpl.compile('Hello ${name}!');
```
执行这个function，传入数据对象，就能得到模板执行的结果了
```javascript
  var text = render({ name: 'etpl' });
```
查看更多例子，或者对模板渲染结果有疑虑，就去ETPL的[example](http://ecomfe.github.io/etpl/example.html "example.html")看看吧。
##**Documents**

通过文档，你可以更详细地了解ETpl的语法格式、使用方法、API等内容。

* [模板语法](Syntax.html)
* [API](API.html)
* [配置参数](config.html)
 
##**Compatibility**
---
###**ETpl3的新语法**

我们认为，当前流行的通过`block`来表达模板继承中的变化，是更好的表达方式。所以在ETpl3中，我们优化了母版的语法，删除了`master`、`contentplacehoder`、`conten`t标签，引入了`block`标签。

对于ETpl2的使用者，我们提供一个[etpl2to3](https://github.com/ecomfe/etpl2to3 "etpl2to3")工具，能够帮助你平滑地将ETpl2的模板翻译成ETpl3。

###**get**

ETpl2中，为了前向兼容，Engine的`get`方法可以根据target名称获取模板内容。

ETpl3不再支持该方法，所有的模板都通过render来使用：

* 直接使用engine实例的render方法
* 调用renderer function   

如果仍需要该功能，说明你正在维护一个遗留系统，并且没有很频繁的升级需求。请继续使用ETpl2。

###**merge**

ETpl的前身是[ER框架](https://github.com/ecomfe/er "ER框架")自带的简易模板引擎，其基本与前身保持兼容。但出于代码体积和使用频度的考虑，ETpl删除了mergeAPI。如果想要该API，请在自己的应用中加入如下代码：
```javascript
/**
 * 执行模板渲染，并将渲染后的字符串作为innerHTML填充到HTML元素中。
 * 兼容老版本的模板引擎api
 * 
 * @param {HTMLElement} element 渲染字符串填充的HTML元素
 * @param {string} name target名称
 * @param {Object=} data 模板数据
 */
etpl.merge = function ( element, name, data ) {
    if ( element ) {
        element.innerHTML = this.render( name, data );
    }
};
```
##**Related**

* Sublime Text 语法高亮插件：[sublime-etpl](https://github.com/ecomfe/sublime-etpl "sublime-etpl")
* vim 语法高亮插件：[vim-etpl](https://github.com/hushicai/vim-etpl "vim-etpl")
* Atom 语法高亮插件：[atom-etpl](https://github.com/ecomfe/atom-etpl "atom-etpl")





