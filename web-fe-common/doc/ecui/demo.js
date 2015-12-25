/*

*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
    
    ui.Demo = core.inherits(
        ui.Control,
        'ui-demo',
        function (el, options) {
            ui.Control.constructor.call(this, el, options);
            var codes=el.getElementsByTagName("code");
            for(var i=0,len=codes.length;i<len;i++){
                
                var scanSouce=$('<div class="scan_code">查看源码</div>');
                (function(i,scanSouce,code){
                    scanSouce.bind("click",function(){
                        if("innerText" in $("#source")[0]){
                            $("#source")[0].innerText=code;
                        }else{
                            $("#source")[0].textContent=code;
                        }
                        $("#source")[0].style.display="block";
                        $("#source").removeClass("prettyprinted");
                        PR.prettyPrint();
                        var fnBodyClick;
                        setTimeout(function(){
                            $(document.body).bind("click",fnBodyClick=function(event){
                                if(!$(event.target).hasClass("scan_code")&&$(event.target).findParents("#source")==null){
                                    $("#source")[0].style.display="none";
                                    $(document.body).unbind("click",fnBodyClick);
                                }
                            });
                        },0);
                    });
                })(i,scanSouce,codes[i].innerHTML);
                $(codes[i]).append(scanSouce);
            }
        },
        {
            
        }
    );
//{if 0}//
}());
//{/if}//
