define(function(require,exports,module){

    var lastInfo="",timer,loadingObj=null;//lastInfo用于防止生成多个相同的alert
    var alertTipWrap=$({
        nodeName:"div",
        id:"alert-tip-wrap"
    })[0];
    var timer=setInterval(function(){
        if(document.body!=null){
            document.body.appendChild(alertTipWrap);
            clearInterval(timer);
        }
    },200);
    utils.loadTemplate(function(){
        /*loadText*
            <!-- target:async-tip-modal -->
            <div class="async-tip-wrap">
                <div class="async-tip-content-wrap">
                    <div class="async-tip-content">
                        <div class="tip-wrap layout-float-wrap">
                            <span class="close">×</span>
                            <div class="tip-icon layout-float-left">
                                <i class="icon-modal-${type}-small"></i>
                            </div>
                            <div class="tip-title layout-float-left">
                                <h3>${title|raw}</h3>
                                <div class="tip-detail">${detail|raw}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- target:async-tip-singleline -->
            <div class="async-tip-wrap">
                <div class="async-tip-content-wrap">
                    <div class="async-tip-content singleline">
                        <div class="singleline-wrap vertical-middle">
                            <!-- if:${type}&&${type}=="loading" -->
                            <span class="mid-icon singleline-icon loading">
                                <i class="icon-loading"></i>
                            </span>
                            <!-- elseif:${type} -->
                            <span class="mid-icon singleline-icon">
                                <i class="icon-modal-${type}-small"></i>
                            </span>
                            <!-- /if --><span class="mid-text singleline-text">${title|raw}</span>
                        </div>
                    </div>
                </div>
            </div>
        */
    });
    function hideElem(hideable,style){
        if(!hideable) return;
        if(style&&style=="fast"){
            hideable.parentNode.removeChild(hideable);
            return;
        }
        if(ecui.browser.ieVersion&&ecui.browser.ieVersion<=8){
            setTimeout(function(){
                if(alertTipWrap.lastChild==hideable){
                    lastInfo=null;
                }
                alertTipWrap.removeChild(hideable);
                
            },800)
        }else{
            $(hideable).animate({opacity:0},500,function(){
                hideable.style.overflow="hidden";
                $(hideable).animate({height:0},300,function(){
                    if(alertTipWrap.lastChild==hideable){
                        lastInfo=null;
                    }
                    alertTipWrap.removeChild(hideable);
                });
            });
        }
        
    }
    window.alertTip={
        show:function(info,oldelem){
            if(utils.getObjType(info)=="string"){
                info={title:info,hide:true,type:"success"};
            }else{
                info=utils.extend({type:"success",hide:true},info);
            }
            var template = "async-tip-modal";
            if(typeof info.detail=="undefined"){
                template = "async-tip-singleline";
            }
            var elem=$(etpl.render(template,info))[0];
            if(JSON.stringify(info)==lastInfo){
                return;
            }
            lastInfo=JSON.stringify(info);
            /*
            if(info.btns){
                var btnWrap=$({
                    nodeName:"div",
                    className:"btn-wrap layout_float_right"
                });
                for(var i=0;i<info.btns.length;i++){
                    btnWrap.appendChild($.create_elem({
                        nodeName:"a",
                        innerHTML:info.btns[i].html,
                        onclick:info.btns[i].callback
                    }));
                }
                $(elem).getElementsByClass("btn-wrap").appendChild(btnWrap);
            }
            */
            if(typeof oldelem!="undefined"){
                alertTipWrap.replaceChild(elem,oldelem);
            }else{
                alertTipWrap.appendChild(elem);
            }
            elem.style.maxHeight=elem.offsetHeight+"px";
            if(info.hide){
                $(elem).hover(function(){
                    clearTimeout(elem.timer);
                },function(){
                    elem.timer=setTimeout(function(){
                        hideElem(elem);
                    },500);
                });
                elem.timer=setTimeout(function(){
                    hideElem(elem);
                },2000);
            }
            return {
                show:function(info){
                    var self=alertTip.show(info,elem);
                    utils.extend(this,self);
                    return this;
                },
                hide:function(style){
                    hideElem(elem,style);
                },
                elem:elem
            };
        },
        hide:function(elem,style){
            hideElem(elem.elem,style);
        }
    }
});
