##**Syntax**

 * 基础
* [语法形式](#语法形式)
* [target](#target)
* [变量替换](#变量替换)
 * 模板复用
* [import](#import)
* [母版](#母版)
* [引用代入](#引用代入)
* [use](#use)
 * 分支与循环
* [if](#if)
* [for](#for)
 * 其他
* [变量声明](#变量声明)
* [内容块过滤](#内容块过滤)

##**基础**

###**<span id="语法形式">语法形式</span>**

ETPL的指令标签默认为HTML注释的形式，在指令标签内允许声明 指令起始、指令结束和注释。

指令起始的语法形式为： <!-- command-name: command-value -->。其中， command-value 的具体语法形式详情请参见各指令相关章节。
```
  <!-- target: targetName -->
  <!-- if: ${number} > 0 -->
  <!-- for: ${persons} as ${person}, ${index} -->
```
指令结束的语法形式为： <!-- /command-name -->。
```
  <!-- /if -->
  <!-- /for -->
  <!-- /target -->
```
注释的语法形式为： <!-- //message -->，注释指令在render时将不输出。
```
  <!-- // just add some message -->
```
如果不期望使用HTML注释形式的指令标签，可以通过config API可以配置指令标签的形式：
```javascript
etpl.config({
    commandOpen: '<%',
    commandClose: '%>'
});

/* 
配置指令标签的形式为“<% ... %>”，然后指令标签可以像下面一样声明:
<% if: ${number} > 0 %>
greater than zero
<% /if %>
*/
```
###**自动结束**

为了减少开发者的工作量，部分指令标签支持自动结束，模板开发者无需手工编写指令结束。比如：当遇见target指令起始时，ETPL自动认为上一个target已经结束。

具体指令的自动结束支持，请参考相应指令相关章节。

###<span id="target">target</span>

target是ETPL的基本单元，其含义是 一个**模版片段** 。target可用于render，也可用于被其他target所import或use，也可以被其他target以母版的方式继承。

在target中可以任意编写block片段。block主要的作用是做为 **可被替换片段** ，在母版或引用代入功能中被使用。详细的使用方式请参考[模板复用](#import "模板复用")章节。

###**语法**

target的语法形式为：
```javascript
  target: target-name
  target: target-name(master=master-name)
```
block的语法形式为：
```
  block: block-name
```
###**自动结束**

target支持自动结束，当遇见 target 时自动结束。

block不支持自动结束，必须手工编写指令结束。

###**示例**
```
  <!-- target: hello -->
  Hello <strong>ETPL</strong>!

  <!-- target: bye -->
  Bye <strong>ETPL</strong>!

  <!-- target: page -->
  <header>
    <!-- block: header -->Header Content<!-- /block --  >
  </header>
  <div class="main"><!-- block: content --><!-- /block   -->  
  </div>
```
###**匿名**target

如果仅仅编写的是一个模板片段，可以省略`target`的声明。这样的编写方式与其他模板引擎类似，ETPL将默认生成匿名target，但模板片段将不可复用（不可被import或use，不可指定母版）。

匿名target应位于模板源码起始。下面例子中，位于其他target后的模板片段Bye将没有任何作用。
```
  <!-- use: hello(name=${name}) -->
  <!-- target: hello -->
  Hello ${name}!
  <!-- /target -->
  Bye
```
###**<span id="变量替换">变量替换</span>**

绝大多数模板引擎都支持变量替换功能。ETPL变量替换的语法为：
```
  ${variable-name}
  ${variable-name|filter-name}
  ${variable-name|filter-name(arguments)}
  ${variable-name|filter1|filter2(arguments)|                   
  filter3|...}
```
variable-name支持.形式的property access。

编写模板时可以指定filter，默认使用html filter进行HTML转义。如果想要保留变量的原形式，需要手工指定使用名称为raw的filter，或者通过config API配置引擎的defaultFilter参数。
```
  ${myVariable|raw}
```
```
  etpl.config({ 
    defaultFilter: ''
  });
```
ETPL默认支持3种filters，可以通过引擎的addFilter方法自定义扩展filter。

* html: html转义
* url: url转义
* raw: 不进行任何转义   

变量替换支持多filter处理。filter之间以类似管道的方式，前一个filter的输出做为后一个filter的输入，向后传递。
```
 ${myVariable|html|url}
```
filter支持参数传递，参数可以使用动态数据。
```
<!-- // 假设存在扩展filter: comma -->
${myVariable|comma(3)}
${myVariable|comma(${commaLength})}
${myVariable|comma(${commaLength}+1)}
```
在变量替换中，引擎会默认将数据toString后传递给filter，以保证filter输入输出的类型一致性。如果filter期望接受的是原始数据，模板开发者需要通过前缀的*指定。
```
<!-- // 假设存在扩展filter: dateFormat -->
${*myDate|dateFormat('yyyy-MM-dd')}
```
##**模板复用**

ETPL支持多种形式的模板复用方式，帮助模板开发者减少模板编写的重复劳动和维护成本。

###<span id="import">import</span>

通过import指令，可以在当前位置插入指定target的源码。

###**语法**

import的语法形式为：
```
  import: target-name
```
###**示例**
```
  <!-- target: hello -->
  Hello <strong>${name}</strong>!

  <!-- target: main -->
  <div class="main"><!-- import: hello --></div>
```
###**自动结束**

如果不编写import的指令结束，其指令起始后立即自动结束。

如果需要使用import的引用代入功能，需要手工编写指令结束。

###**<span id="母版">母版</span>**

target声明时可以通过**master=master-name** 指定一个继承的母版。并且通过自身的`block`指令，能够替换母版中同名`block`指令声明部分的内容。

模版继承（母版）功能允许你在一开始就对多个相似的模板从“结构”的角度进行抽象。继承自一个和你具有相同结构的母版，你可以无需再编写结构骨架部分，只需要编写结构内部的内容差异部分。

###**示例**
```
  <!-- target: myTpl(master = page) -->
  <!-- block: content -->
    Hello ${name}!
  <!-- /block -->

  <!-- target: page -->
  <header>
  <!-- block: header -->Header Content<!-- /block -->
  </header>
  <div class="main"><!-- block: content --><!-- /block -->
  </div>
```
###**复杂示例**
```
  <!-- target: myMaster -->
  <div class="title">
    <!-- block: title -->title<!-- /block -->
  </div>
  <div class="main">
    <!-- block: main --><!-- /block -->
  </div>

  <!-- target: myMaster-has-sidebar(master=myMaster) 
  -->
  <!-- block: title -->title for has sidebar<!-- /block 
  -->
  <!-- block: main -->
    <div class="sidebar"><!-- block: sidebar --><!-- /block 
    -->
    </div>
    <div class="article"><!-- block: article --><!-- /block 
    -->
    </div>
  <!-- /block -->

  <!-- target: myTarget(master=myMaster) -->
  <!-- block: title -->
    Building WebKit from Xcode
  <!-- /block -->
  <!-- block: main -->
    <p>To build from within Xcode, you can use the WebKit workspace. </p>
  <!-- /block -->

  <!-- target: myTarget-has-sidebar(master=myMaster-has-sidebar) -->
  <!-- block: sidebar -->
    <ul class="navigator">...</ul>
  <!-- /block -->
  <!-- block: article -->
    <p>To build from within Xcode, you can use the WebKit workspace. </p>
  <!-- /block -->
```
###**<span id="引用代入">引用代入</span>**

通过`import`指令引入一个`targe`t时，可以定制其`block`部分的内容。

如果有一个模板的大部分可以复用时，通过引用代入功能，你可以在引用时抹平差异，定制其中差异部分内容。当你面临结构种类数量爆炸时，引用代入提供了另一种更灵活的复用方式。

使用引用代入功能，`import`需要手工编写指令结束，并且`import`中只允许包含`block`，其他指令将被忽略。

###**示例**
```
<!-- target: myTpl -->
<!-- import: header -->
<!-- import: main -->
    <!-- block: main -->
        <div class="list">list</div>
        <div class="pager">pager</div>
    <!-- /block -->
<!-- /import -->

<!-- target: header -->
<header><!-- block: header -->default header<!-- /block --></header>

<!-- target: main -->
<div>
    <!-- block: main -->default main<!-- /block -->
</div>
```
###<span id="use">use</span>

通过`use`指令，可以调用指定`target`，在当前位置插入其`render`后的结果。允许使用静态或动态数据指定数据项。

在面临多种不同的数据名称、相似的结构时，动态调用可以让你只编写一份代码，多次调用。

###**语法**

use的语法形式为：
```
use: target-name
use: target-name(data-name=expression, data-name=expression)
```
###**示例**
```
<ul>
<!-- for: ${persons} as ${p} -->
    <!-- use: item(main=${p.name}, sub=${p.email}) -->
<!-- /for -->
</ul>

<!-- target: item --><li>${main}[${sub}]</li>
```
###**自动结束**

use无需编写指令结束，其将在指令起始后立即自动结束。

##**分支与循环**

###<span id="if">if</span>

ETPL提供了分支的支持，相关指令有`if`、`elif`、`else`。

###**语法**

if的语法形式为：
```
if: conditional-expression
```
elif的语法形式为：
```
elif: conditional-expression
```
else的语法形式为：
```
else
```
conditional-expression中可以使用动态数据，通过`${variable}`的形式，可以使用模板render的data。`${variable}`支持.的property accessor。

###**自动结束**

if指令不支持自动结束，必须手工编写指令结束`<!-- /if -->`。

###**示例**
```
<!-- if: ${number} > 0 -->
larger than zero
<!-- elif: ${number} == 0 -->
zero
<!-- else -->
invalid
<!-- /if -->
```
###**自动结束**

if指令不支持自动结束，必须手工编写指令结束。
```
<!-- /if -->
```
###**<span id="for">for</span>**

通过for指令的支持，可以实现对Array和Object的遍历。Array为正序遍历，Object为不保证顺序的forin。

###**语法**

for的语法形式为：
```
for: ${variable} as ${item-variable}
for: ${variable} as ${item-variable}, ${index-variable}
for: ${variable} as ${item-variable}, ${key-variable}
```
其中，`${variable}`为想要遍历的对象，支持.形式的property access。在遍历过程中，声明的`${item-variable}`和`${index-variable}`，分别代表数据项和索引（遍历Object时为键名）。

###**示例**
```
<ul>
<!-- for: ${persons} as ${person}, ${index} -->
<li>${index}: ${person.name}
<!-- /for -->
</ul>
```
###**自动结束**

for指令不支持自动结束，必须手工编写指令结束。
```
<!-- /for -->
```
##**其他**

###**<span id="变量声明">变量声明</span>**

通过`var`指令可以在模板内部声明一个变量。声明的变量在整个`target`内有效。

语法

var的语法形式为：
```
var: var-name=expression
```
`expression`中可以使用静态或动态数据。

###**示例**
```
<!-- var: age = 18 -->
<!-- var: age = ${person.age} -->
<!-- var: name = 'etpl' -->
```
###**自动结束**

`var`无需编写指令结束，其将在指令起始后立即自动结束。

###**<span id="内容块过滤">内容块过滤</span>**

除了在变量替换中可以使用`filter`进行处理，ETPL还可以通过`filter`指令，使用指定的`filter`对一个模板内容块进行过滤处理。

###**语法**

filter的语法形式为：
```
filter: filter-name
filter: filter-name(arguments)
```
###**示例**

下面的例子假定使用者实现了一个`markdown`的`filter`
```
<!-- filter: markdown(${useExtra}, true) -->
## markdown document

This is the content, also I can use `${variables}`
<!-- /filter -->
```
###**自动结束**

filter指令不支持自动结束，必须手工编写指令结束。
```
<!-- /filter -->
````