define(function(){
    /*工具性函数*/
    var utils={
        //是否是html元素
        isElementNode:function(elem){
            if(typeof elem.nodeType!="undefined"&&elem.nodeType==1){
                return 1;
            }else{
                return 0;
            }
        },
        trim:function(string){
            if(this.getObjType(string)!="string"){
                return string;
            }
            if(string.trim){
                return string.trim();
            }else {
                return string.replace(/^\s*|\s*$/g,"");
            }
        },
        //获取对象类型
        getObjType:function(obj){
            return Object.prototype.toString.call(obj).slice(8,-1).toLowerCase();
        },
        //对象合并继承
        extend:function(newObj,oldObj){
            for(var i in oldObj){
                if(this.getObjType(oldObj[i])=="object"){
                    if(typeof newObj[i]=="undefined"){
                        newObj[i]={};
                    }
                    this.extend(newObj[i],oldObj[i]);
                }else{
                    newObj[i]=oldObj[i];
                }
            }
            return newObj;
        },
        tween:{
            linear:function(t,b,c,d){
                t=Math.min(t,d);
                c=c-b;
                return c*t/d + b; 
            }
        },
        loadTemplate: function(template) {
            var funcstr=template.toString();
            var reg=/\/\*loadText\*([\s\S]+?)\*\//gm;
            reg_result=reg.exec(funcstr);
            if(reg_result!=null){
                etpl.compile(reg_result[1]);
            }
        }
    }
    window.utils=utils;
    return utils;
});