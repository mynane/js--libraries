##<center>cookie 的增删改查</center>

> * cookie在浏览器中存放的结构是key=value;key=value;key=value
> * JS设置cookie

    document.cookie="name"+username;

> * JS读取cookie
> * 假设cookie中存储的内容为：`name=jack;password=123`
> * 则在B页面中获取变量username的值js代码如下

    var username=document.cookie.split(';')[0].split("=")[1];
> * js操作cookie的方法
> * 写cookie

    function setCookie(name,value){
	    var Days=30;
	    var exp= new Date();
	    exp.setTime(exp.getTime()+Days*24*60*60*1000);
	    document.cookie=name+"="+escape(value)+";expires="+exp.toGMTString();
    }

> * 读取cookie

    function getCookie(name){
	    var arr,reg=new RegExp("(^|)"+name+"=([^;]*)(;|$)");
	    if(arr=document.cookie.match(reg))
	        return unescape(arr[2]);
	    else
	        return null;
    }
> * 读取cookie

    getCookie('hazer')    

> * 删除cookie

    function delCookie(name){
	    var exp=new Date();
	    exp.setTime(exp.getTime()-1);
	    var cval=getCookie(name);
	    if(cval!=null)
	    document.cookie=name+"="+cval+";expires="+exp.toGMTString();
    }
> * 使用方法

    delCookie('hazer')

> * 设置cookie

    function setCookie(name,value,time){
	    var strsec=getsec(time);
	    var exp=new Date();
	    exp.setTime(exp.getTime()+strsec*1);
	    document.cookie=name+"="+escape(value)+";expires="+exp.toGMTSting();
    }
    function getsec(str){
	    var str1=str.substring(1,str.length)*1;
	    var str2=str.substring(0,1);
	    if(str2=='s'){
	        return str1*1000;
	    }else if(str2=='h'){
	        return str1*60*60*1000;
	    }else if(str2=='d'){
	        return str1*24*60*60*1000;
	    }
    }
> 使用示例
* s20是20秒
* h20是20小时
* d20是20天
 
    setCookie('name',"hayden","s20");