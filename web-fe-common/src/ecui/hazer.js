(function(){
	 var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
        /**
        * 设置 Element 对象的属性值。
        * 在 IE 下，Element 对象的属性可以通过名称直接访问，效率是 setAttribute 方式的两倍。
        * @public
        *
        * @param {HTMLElement} el Element 对象
        * @param {object} obj 对像集合
        * @return {string} 属性值
        */
        function setAttribute(el,obj){
                if(ieVersion<8){
                        for(var a in obj){
                                el[a] = obj[a];
                        }
                } else {
                        for(var a in obj){
                                el.setAttribute(a, obj[a]);
                        }
                }
        };
        function getAttribute(el,name){
            if(ieVersion<8){
                return el[name];
            }else{
                return el.getAttribute(name);
            }
        }
        function moveEnd(obj,num) {
            var num=num?num:0;
        if (document.selection) {
            var sel = obj.createTextRange();
            sel.moveStart('character', num);
            sel.collapse();
            sel.select();
        } else if (typeof obj.selectionStart == 'number'
            && typeof obj.selectionEnd == 'number') {
            obj.selectionStart = obj.selectionEnd = num;
        }
        }
        function stopDefault( e ) { 

         //阻止默认浏览器动作(W3C) 

         if ( e && e.preventDefault ) 

             e.preventDefault(); 

         //IE中阻止函数器默认动作的方式 

         else

             window.event.returnValue = false; 

         return false; 

         }
       ui.Placeholder=core.inherits(
        ui.Control,
        'ui-placehoder',
        function(el,options){
            var _input=el;
            ui.Control.constructor.call(this, el, options);
            var placeholder=getAttribute(_input,'placeholder');
            placeholder = placeholder ? placeholder : options.def ? options.def : '请输入内容';

            if(ieVersion<10){
                setAttribute(el,{value:placeholder,style:"color:#9D9E9F"});
            }else{
                setAttribute(el,{placeholder:placeholder});

            }
            this._input=_input;
            this.dele=false;
        },
        {
           $focus:function(event){
              ui.Control.prototype.$focus.call(this, event);
              var that=this;
              dom.addEventListener(this._input,'focus',function(event){
                if(this.value===this.defaultValue){
                    moveEnd(this);
                }
                dom.addEventListener(this,'keydown',function(event){
                    var event=event||window.event;
                    if(!that.dele&&(event.keyCode!=37&&event.keyCode!=38&&event.keyCode!=39&&event.keyCode!=40)||(that.dele&&this.value==this.defaultValue&&(event.keyCode!=37&&event.keyCode!=38&&event.keyCode!=39&&event.keyCode!=40))){
                        this.value='';
                        that.dele=true;
                        setAttribute(this,{style:"color:#000"});
                    }else if(!that.dele&&(event.keyCode==37||event.keyCode==38||event.keyCode==39||event.keyCode==40)||(that.dele&&this.value==this.defaultValue)){
                        setAttribute(this,{style:"color:#9D9E9F"});
                       stopDefault(event);
                    }
                });
                dom.addEventListener(this,'mousedown',function(event){
                    if(!that.dele){
                        moveEnd(that);
                    }
                });
              });
           },

           $blur:function(event){
            ui.Control.prototype.$blur.call(this,event);
            dom.addEventListener(this._input,'blur',function(event){
                if(this.value===''){
                    this.dele=false;
                    this.value=this.defaultValue;
                    setAttribute(this,{style:"color:#9D9E9F"});
                }
            })
           },
        });


}(ecui));


(function(){
     var core = ecui,
        dom = core.dom,
        io=core.io,
        ui = core.ui,
        util = core.util,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
        /**
        * 设置 Element 对象的属性值。
        * 在 IE 下，Element 对象的属性可以通过名称直接访问，效率是 setAttribute 方式的两倍。
        * @public
        *
        * @param {HTMLElement} el Element 对象
        * @param {object} obj 对像集合
        * @return {string} 属性值
        */
        function setAttribute(el,obj){
                if(ieVersion<8){
                        for(var a in obj){
                                el[a] = obj[a];
                        }
                } else {
                        for(var a in obj){
                                el.setAttribute(a, obj[a]);
                        }
                }
        };
        /**
         * 获取属性封装
         * @param  {[HTMLElement]} el   目标对象
         * @param  {[string]} name 属性名
         * @return {[string]}      属性值
         */
        function getAttribute(el,name){
            if(ieVersion<8){
                return el[name];
            }else{
                return el.getAttribute(name);
            }
        }
        /**
        *console.log()封装简写
        */
        function c(str){
            console.log(str);
        }
        ui.JsonTree=core.inherits(
            ui.Control,
            'ui-json',
            function(el,options){
                ui.Control.constructor.call(this, el, options);
                var that=this;
                var src=options.json;
               io.loadScript('hazer/json.js',function(){
                    _fold();
               });

               function _fold(){
                 // console.log(eval(src));
                 var _json=eval(src);
                 var len=_json.length;
                 var _current=null;
                 if(len>0){
                    function  exhaustion(_current){

                    }
                    _current=_json[0];
                    while(_current.children){
                        _current=_current.children;
                    }
                    c(_current);
                 }
                 

               }
              
               // setAttribute(el,{style:"height:20px;border:1px solid #333;width:30px;"});
               this._jTree=el;
            },
            {
                $click:function(event){
                     ui.Control.prototype.$click.call(this,event);
                   
                }
            });

}(ecui))