##esr模块定义变量和方法
* 变量  
 
```javascript
    var routes = {},
        autoRender = {},
        context,
        currLocation = '',
        pauseStatus;
```
* 方法

1.增加ie的history信息
    
        addIEHistory(loc)
2.调用指定路由

        callRoute(name,options)
3.事件监听处理函数

        listener()
4.初始化

        init()
5.解析地址

        parseLocation(loc)
6.渲染

        render(name,route)
7.设置数据

        setData(control,value)
##ecui.esr(object)
>定义

        DEFAULT_MAIN:"main"  
        DEFAULT_PAGE:"index"
没有hash值时默认index用main来放
>添加路由

        addRoute(name,route)
>调用路由处理

        callRoute(loc,childRoute)        
`loc`为地址，childRoute是否为子路由，默认不是
>改变地址，常用于局部刷新  
    
        change(name,options,rewrite) 
name路由名，options需要改变的参数，rewrite是否写回原来的参数。
>设置数据

        setData(name,value)
>获取数据

        getData(name)
return context[name]
>获取当前地址

        getLocation()
当前地址,不带#
>获取路由信息

        getRoute(name)
name为路由名
>控制定位器转向
        
        redirect(loc)
如果不输入loc，就跳转到ecui.esr.DEFAULT_PAGE,只有currLocation与route不同时才进行route。
>渲染
        
        render(name,route)
name路由名，route路由对象，这是与模板引擎链接的地方
>设置hash值，不会真正的跳转

        setLocation(loc)
>加载ESR框架

        load()
这是esr模块起始的地方
>动态加载模块，用于测试

        loadmodule(name)
会在页面中插入‘<script type="text/javascript" src="' + name + '/' + name + '.js" module="' + name + '"></script>
>动态加载模块名，用于测试
     
        loadmoduleName()
会查找页面script标签找到里面包含module属性的name，会加载：  
1. name/class.filename.js  
2. name/route.filename.js  
3. name/route.filename.css  
4. name/route.filename.html
>请求数据
  
        request(urls,onsuccess,onerror)
urls：url列表，支持name@url的写法，表示结果数据写入name变量中  
onsuccess，全部请求成功时调用函数  
onerror，至少一个请求失败时调用的函数，会传入一个Array，说明那些URL失败        
