ecui.esr.addRoute("index",{
    view:"index",
    main:"main_container",
    onafterrender:function(context){
        console.log(context);
    }
});