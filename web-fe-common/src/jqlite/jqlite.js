define(["module/util/util"], function(){
    var jQuery=function(selector){
        selector = utils.trim(selector);
        this.selector=selector;
        //如果selector是以#开始的，就直接通过getElementById获取
        if(/^#(.+)$/.test(selector)){
            this[0]=document.getElementById(/^#(.+)$/.exec(selector)[1]);
            this.length=1;
        }else if(utils.isElementNode(selector)){//如果是单个element
            this[0]=selector;
            this.length=1;
        }else if(typeof selector.length!="undefined"&&utils.getObjType(selector)!=="string"){//如果是element数组
            for(var i=0,len=selector.length;i<len;i++){
                this[i]=selector[i];
            }
            this.length=selector.length;
        }else if(/^</.test(selector)){//如果是传入html字符串，就自动新建标签
            var elemTemp=document.createElement("div"),
                result=[];
            elemTemp.innerHTML=selector;
            for(var i=0,len=elemTemp.childNodes.length;i<len;i++){
                if(elemTemp.childNodes[i].nodeType==1){
                    result.push(elemTemp.childNodes[i]);
                }
            }
            return _$(result);
        }else if(utils.getObjType(selector)==="object"){
            if(!(selector&&selector.nodeName)){
                return null;
            }
            if((typeof selector.reload!="undefined")&&selector.reload){
                var elem =typeof selector.id=="string"?document.getElementById(selector.id):selector.id;
                elem.innerHTML="";
            }else{
                 var elem = document.createElement(selector.nodeName);
            }
            for (var i in selector) {
                if (i == "nodeName") {
                    continue;
                } else if (i == "childs") {
                    var tmp_obj = selector[i];
                    for (var j = 0, len = tmp_obj.length; j < len; j++) {
                        if(!tmp_obj[j]){
                            continue;
                        }
                        if (tmp_obj[j].ownerDocument) {
                            elem.appendChild(tmp_obj[j]);
                        } else {
                            elem.appendChild(arguments.callee(tmp_obj[j]));
                        }
                    }
                } else if (i == "css") {
                    var styles = selector[i];
                    for (var j in styles) {
                        if (j == "float") {
                            if (document.all) {
                                elem.style.styleFloat = styles[j];
                            } else {
                                elem.style.cssFloat = styles[j];
                            }
                        } else {
                            elem.style[j] = styles[j];
                        }
                    }
                }else if(i == "className"){
                    _$(elem).addClass(selector[i]);
                }else if (typeof elem[i] != "undefined") {
                    elem[i] = selector[i];
                } else {
                    elem.setAttribute(i, selector[i]);
                }
            }
            return _$(elem);
        }
    }
    jQuery.prototype.addClass=function(classname){
        for(var i=0,len=this.length;i<len;i++){
            ecui.dom.addClass(this[i],classname);
        }
        return this;
    }
    jQuery.prototype.removeClass=function(classname){
        for(var i=0,len=this.length;i<len;i++){
            ecui.dom.removeClass(this[i],classname);
        }
        return this;
    }
    jQuery.prototype.hasClass=function(classname){
        return ecui.dom.hasClass(this[0],classname);
    }
    jQuery.prototype.text=function(text){
        if(typeof this[0].textContent!="undefined"){
            this[0].textContent=text;
        }else{
            this[0].innerText=text;
        }
    }
    jQuery.prototype.append=function(childs){
        if(utils.isElementNode(childs)){
            this[0].appendChild(childs);
        }else{
            var frag=document.createDocumentFragment();
            for(var i=0,len=childs.length;i<len;i++){
                frag.appendChild(childs[i]);
            }
            this[0].appendChild(frag);
        }
    }
    jQuery.prototype.css=function(pro,value){
        if(typeof value=="undefined"){
            return ecui.dom.getStyle(this[0],pro);
        }else{
            ecui.dom.setStyle(this[0],pro,value);
        }
    }
    jQuery.prototype.hover = function(over,out) {
        this.bind("mouseover",over);
        this.bind("mouseout",out);
    }
    jQuery.prototype.bind = function(type,handler) {
        if(type=="mousewheel"){
            type="mousewheel DOMMouseScroll";
        }
        type=type.split(" ");
        for(var i=0,len=type.length;i<len;i++){
            this._bind(type[i],handler);
        }
    }
    jQuery.prototype._bind = function(type,handler) {
        var element = this[0];
        var self=this;
        function callback(event){
            event=event||window.event;
            if(!event.target){
                event.target=event.srcElement;
            }
            if(!event.preventDefault){
                event.preventDefault=function(){
                    event.returnValue=false;
                }
            }
            if(!event.stopPropagation){
                event.stopPropagation=function(){
                    event.cancelBubble=false;
                }
            }
            if(event.detail){
                event.wheelDelta=-event.detail * 40;
            }
            if (typeof event.charCode == "number") {
                event.keyCode=event.charCode;
            }
            for(var i=0,len=elementEvents[type].length;i<len;i++){
                elementEvents[type][i]&&elementEvents[type][i].call(element,event);
            }
        };
        if(typeof element._events=="undefined"){
            element._events={};
        }
        var elementEvents=element._events;
        if(!(type in elementEvents)){
            elementEvents[type]=[handler];
            if (typeof element.addEventListener!="undefined") {
                element.addEventListener(type, callback, false);
            } else if (typeof element.attachEvent!="undefined") {
                element.attachEvent("on" + type, callback);
            }
        }else{
            var isExist=false;
            for(var i=0,len=elementEvents[type].length;i<len;i++){
                if(elementEvents[type][i]==handler){
                    isExist=true;
                    break;
                }
            }
            if(!isExist){
                elementEvents[type].push(handler);
            }
        }
    }
    jQuery.prototype.unbind = function(type,handler) {
        var element = this[0];
        var elementEvents=element._events;
        if(elementEvents&&(type in elementEvents)){
            for(var i=0,len=elementEvents[type].length;i<len;i++){
                if(elementEvents[type][i]==handler){
                    elementEvents[type].splice(i,1);
                }
            }
        }
    }
    jQuery.prototype.findByClass=function(classname){
        var elem = this[0];
        var result=[];
        if(elem.getElementsByClassName){
            result=elem.getElementsByClassName(classname);
        }else if(elem.getElementsByClassName){
            
        }else{
            var childs=elem.getElementsByTagName("*");
            for(var i=0,len=childs.length;i<len;i++){
                var child=childs[i];
                if(child.nodeType==1&&$(child).hasClass(classname)){
                    result.push(child);
                }
            }
        }
        return result.length==0?null:(_$(result));
    }
    jQuery.prototype.findParents=function(selector){
        var attrs={};
        if(typeof selector.nodeType!="undefined"&&selector.nodeType==1){//可以传入html标签实例
            attrs.elem=selector;
        }else{//也可以传入id，class选择器
            var reg_result=/^(?:#(.+))|(?:\.(.+))$/g.exec(selector);
            if(reg_result[1]!=null&&reg_result[1]!=""){
                attrs.id=reg_result[1];
            }
            if(reg_result[2]!=null&&reg_result[2]!=""){
                attrs.className=reg_result[2];
            }
        }
        var parent_elem = this[0];
        while (parent_elem) {
            if (parent_elem != null && parent_elem != document.body) {
                    var isparent = true;
                    for (var i in attrs) {
                        if (!(i == "className" ? new RegExp("(^| )"+attrs[i]+"( |$)").test(parent_elem[i]) : (i=="elem"?parent_elem==attrs[i]:parent_elem[i] == attrs[i]))) {
                            isparent = false;
                        }
                    }
                    if (isparent) {
                        return _$(parent_elem);
                    } else {
                        parent_elem = parent_elem.parentNode;
                    }
            } else {
                    return null;//如果没有找到就返回null
            }
        }
    }
    jQuery.prototype.data = function(key,value) {
        if(this.length==0) return;
        if(typeof value==="undefined"){
            return typeof this[0][key]=="undefined"?undefined:this[0][key];
        }else{
            this[0][key]=value;
        }
    }
    jQuery.prototype.children=function(classname){
        return ecui.dom.children(this[0],classname);
    }
    jQuery.prototype.ie_animate=function(param,timer,callback){//如果不支持css3动画，就计算实现
        clearTimeout(this.data("animateTimer"));
        var startValue={},timer=timer||500,self=this;
        var startTime=new Date()*1;
        var endTime=timer;
        for(var i in param){
            startValue[i]=parseInt(this.css(i));
        }
        var _run=function(){
            var time=new Date()*1-startTime;
            for(var i in param){
                var now=utils.tween.linear(time,startValue[i],parseFloat(param[i]),endTime);

                if(/^width|height|top|left|right|bottom|border.*|padding.*|margin.*$/.test(i)){
                    self.css(i,now+"px");
                }else{
                    self.css(i,now);
                }
            }
            if(time>=endTime){
                callback&&callback();
            }else{
                self.data("animateTimer",setTimeout(_run,13));
            }
        }
        _run();
    }
    jQuery.prototype.animate=function(param,timer,callback){//如果支持css3就用css3实现
        var prefix=["","webkit","moz","ms","o"],self=this,timer=timer||500,
        cssTransition=["transition","webkitTransition","mozTransition","msTransition","oTransition"],
        cssTransitionStyle=["transition","-webkit-transition","-moz-transition","-ms-yransition","-o-transition"],
        cssTransitionEvent=["transitionend","webkitTransitionEnd","mozTransitionEnd","msTransitionEnd","oTransitionEnd"];
        function _is_support_transtion(){
            if(!window.getComputedStyle) return false;
            var div=document.createElement("div");
            var cssRules=window.getComputedStyle(div);
            var result=false;
            for(var i=0,len=cssTransition.length;i<len;i++){
                if(typeof cssRules[cssTransition[i]]!="undefined"){
                    return i;
                }
             }
             return result;
        }
        var p=_is_support_transtion();
        if(p!==false){
            var oldTransition=this.css(cssTransition[p]);
            var newTransition="",listener,queue=[],regStr="(";
            for(var i in param){
                regStr+=i+"|";
                newTransition+=i+" "+timer+"ms linear,";
            }
            regStr=regStr.slice(0,-1)+")[^,]*,?";
            var reg=new RegExp(regStr,"g");
            if(oldTransition!=""){
                oldTransition=oldTransition.replace(reg,"");
                newTransition=oldTransition+","+newTransition;
            }
            newTransition=newTransition.replace(/^(.*)(,)$/,"$1");
            this[0].style[cssTransition[p]]=newTransition;
            for(var i in param){
                if(parseFloat(this.css(i)).toFixed(1)!=parseFloat(param[i]).toFixed(1)){
                    queue.push(i);
                    self[0].style[i]=this.css(i);
                }
            }
            if(this.data("animating")){
                try{
                    self.unbind(cssTransitionEvent[p],self.data("animateListener"),false);
                }catch(ex){}
            }
            setTimeout(function(){
                if(queue.length>0){
                    self.data("animating",true);
                    for(var i in param){
                        self[0].style[i]=param[i];
                    }
                    self.bind(cssTransitionEvent[p],listener=function(event){
                        queue=queue.filter(function(value,key){
                            return value!=event.propertyName;
                        });
                        if(queue.length==0){
                            self.unbind(cssTransitionEvent[p],listener,false);
                            self.data("animating",false);
                            self[0].style[cssTransition[p]]=newTransition.replace(reg,"").replace(/^(.*)(,)$/,"$1");
                            callback&&callback();
                        }
                    },false);
                    self.data("animateListener",listener);
                }else{
                    callback&&callback();
                }
            },0);
        }else{
            this.ie_animate(param,timer,callback);
        }
    }
    var _$=function(selector){
        return new jQuery(selector);
    }
    utils.extend(_$,utils);
    return _$;
});


