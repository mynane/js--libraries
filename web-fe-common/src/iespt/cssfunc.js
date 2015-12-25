function ie7insertba(elem,type,neirong){
    var className="ie7insert"+type;
    if(type=="before"){
        var newelem=elem.insertBefore(document.createElement("span"),elem.firstChild);
    }else{
        var newelem=elem.appendChild(document.createElement("span"));
    }
    newelem.className=className;
    newelem.innerHTML=neirong;
    elem.runtimeStyle.behavior="1";
}
function cssIe7FirstLast(elem){
    var first = elem.firstChild;
    while(first.nodeType != 1){
        first = first.nextSibling;
    }
    var classname = first.className;
    classname = classname.split(/\s+/).indexOf("first-child");
    classname += classname + "first-child";
}