ecui.esr.addRoute("tree", {
    main: "main_container",
    onafterrender: function () {
        var mytree = ecui.get("mytree");
        console.log(mytree);
    }
});
