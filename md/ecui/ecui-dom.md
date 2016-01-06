##ecui.dom
主要提供了一些常用的dom操作方法的封装（主要做的是方法的兼容）
>class添加

        addClass(el,className)
为了考虑性能并没有检测class是否存在
>class是否存在

        hasClass(el,className)
>class删除

        removeClass(el,ClassName)
>添加事件

        addEventListener(obj,type,func)
对添加事件做了兼容
>移除事件
        
        removeEventListener(obj,type,func)
>子元素移动
    
        childMoves(el,target,all)
将元素内的子元素移动到目标元素内部all表示是否将所有子元素栋移动默认false
>获取子元素

        children(el)
>检测元素是否是另一元素的子元素

        contain(container,contained)
>创建元素

        create(className,tagName)
如果不提供tagName默认为`<div>`
>获取第一个子节点

        first(el)
>获取最后一个子节点
        
        last(el)
>获取元素属性

        getAttribute(el,name)
>设置元素属性

        setAttribute(el,name,value)        

>获取元素父元素
        
        getParent(el)
>获取元素的位置信息
    
        getPosition(el)
返回Object{top:top,left:left}
>获取元素的样式

        getStyle(el,name)
>设置元素样式
    
        setStyle(el,name,value)
>获取元素内容文本

        getText(el)
>在元素之后插入元素
    
        insertAfter(el,target)
>在元素之前插入元素

        insertbefore(el,target)
>在元素指定位置插入内容

        insertHTML(el,position,html)
`position`为AFTERBEFORE\BEFOREEND\BEDOREBEGIN\AFTEREND可小写，主要靠`insertAdjacentHTML()`方法实现
>获取元素下一个兄弟元素

        next(el)
>获取元素上一个兄弟元素

        previous(el)
>移除元素

        remove(el)
>设置输入框的表单项属性

        setInput(el,name,type)


        








































