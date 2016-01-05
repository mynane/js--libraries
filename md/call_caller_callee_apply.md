##<center>介绍call，callee，caller，apply的区别与应用</center>

###1、caller与callee的区别
>caller返回一个函数引用，这个函数调用了当前的函数；callee返回正在执行的函数本省的引用，他是arguments的一个属性

>caller返回一个函数的引用，这个函数调用了当前的函数。

> 使用这个属性应该注意：

> > a、这个属性只有在函数执行时才有用

> > b、如果在javascript程序中，函数由顶层调用的，则返回null

>functionName.caller：functionName是当前正在执行的函数

    var a = function() {   
        alert(a.caller);   
    }   
    var b = function() {   
        a();   
    }   
    b();  

> 上面代码。b调用了a，那么a.caller返回的是b的引用

> 返回：

    function(){
	    a();
    }


> 如果直接调用a(),即顶层调用，就会返回null。

> callee返回正在执行的函数本身的引用，他是arguments的一个属性

> 使用callee时应注意：

> > a、这个属性只有在函数执行时才有效

> > b、他有一个length属性，可以获取形参的个数，因此可以用来比较形参和实参个数是否相等，系比较arguments.length是否相等。

    var a = function() {   
        alert(arguments.callee);   
    }   
    var b = function() {   
        a();   
    }   
    b(); 

> a在b中被调用，但他返回了a的引用，结果如下：

    function(){
	    alert(arguments.callee);
    } 


###2、call与apply的应用与区别

语法：`call([thisObj[,arg1[, arg2[, [,.argN]]]]])`

语法：`apply([thisObj[,argArray]])`