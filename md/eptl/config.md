##**Config**

* [commandOpen](#commandOpen)
* [commandClose](#commandClose)
* [commandSyntax](#commandSyntax)
* [variableOpen](#variableOpen)
* [variableClose](#variableClose)
* [defaultFilter](#defaultFilter)
* [strip](#strip)
* [namingConflict](#namingConflict)

通过engine初始化时构造函数参数，或者engine实例的config方法，可以配置ETpl引擎的参数。
```
etplEngine.config( {
    strip: true
} );
```
下面是ETpl支持的参数列表。

###**<span id="commandOpen">commandOpen<span>**

`string`

命令语法起始串，默认值为 <!--

###**<span id="commandClose">commandClose<span>**

`string`

命令语法结束串，默认值为 -->

###**<span id="commandSyntax">commandSyntax<span>**

`RegExp`

命令语法格式。设置该参数时，正则需要包含3个matches：

1. 命令结束标记
2. 命令名称
3. 命令值

###**<span id="variableOpen">variableOpen<span>**

`string`，默认值为 ${

变量语法起始串

###**<span id="variableClose">variableClose<span>**

`string`

变量语法结束串，默认值为 }

###**<span id="defaultFilter">defaultFilter<span>**

`string`

默认变量替换的`filter`，默认值为 `html`

###**<span id="strip">strip<span>**

`boolean`

是否清除命令标签前后的空白字符，默认值为 false

###**<span id="namingConflict">namingConflict<span>**

`string`

target或master名字冲突时的处理策略，值可以是:

* `error`: 抛出错误。此项为默认值
* `ignore`: 保留现有目标，忽略新目标
* `override`: 覆盖现有目标