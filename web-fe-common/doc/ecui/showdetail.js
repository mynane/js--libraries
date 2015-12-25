/**
对长文本进行展开收起处理

例子
<div ui="type:showdetail;rows:9;width:1422;openBtnHtml:<span class=open-detail-btn href=#>展开</span>;closeBtnHtml:<span class=close-detail-btn href=#>收起</span>;leftEmptyChar:40;" style="word-break:break-all;word-wrap:break-word;">
    <input type="hidden" value="文本内容">
</div>

参数
rows           - 显示几行
width          - 元素宽度
leftEmptyChar  - 右边预留的空白字符数 随机数种子 也就是最多空白这么多字符，然后随机
openBtnHtml    - 展开按钮的html， 如果让组件处理展开逻辑 就加上 open-detail-btn
closeBtnHtml   - 收起按钮的html， 如果让组件处理收起逻辑 就加上 close-detail-btn

*/
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
    ui.Showdetail=core.inherits(
        ui.Control,
        "ui-showdetail",
        function (el, options) {
            ui.Control.constructor.call(this, el, options);
            //从html获取基本信息
            var hiddenInput = document.getElementsByTagName("input")[0];
            var fontSize = dom.getStyle(el,"fontSize"),
                styleWidth = options.width,
                totalWidth = styleWidth * options.rows,
                leftEmpty = options.rows-1,
                openBtnHtml = options.openBtnHtml||"<span class=open-detail-btn href=#>展开</span>",
                closeBtnHtml = options.closeBtnHtml||"<span class=close-detail-btn href=#>收起</span>";
            leftEmpty = leftEmpty + Math.floor(Math.random() * options.leftEmptyChar);
            //创建一个可以计算字符显示宽度的辅助元素
            var tempInput = document.createElement("input");
            tempInput.style.cssText = "font-size:" + fontSize+";position:fixed;top:-999999999999px";
            document.body.appendChild(tempInput);
            //计算应该显示多少元素
            var totalHtml = hiddenInput.value,
                simpleHtml;
            var tempEl = document.createElement("div");
            tempEl.innerHTML = totalHtml;
            var totalText = tempEl.innerText ? tempEl.innerText : tempEl.textContent;
            var searchIndex, searchMin=0, searchMax=totalText.length,oldIndex;
            //二分查找
            while(1){
                nowIndex=Math.floor((searchMin+searchMax)/2);
                tempInput.value = totalText.substring(0, nowIndex);
                if(totalWidth-tempInput.scrollWidth<=4 && totalWidth-tempInput.scrollWidth>=0){
                    simpleHtml = totalText.substring(0, nowIndex - leftEmpty) + openBtnHtml;
                    el.innerHTML = simpleHtml;
                    break;
                } else if (tempInput.scrollWidth-totalWidth>4){
                    searchMax = nowIndex;
                } else if ((totalWidth - tempInput.scrollWidth>=-4  &&  totalWidth - tempInput.scrollWidth<=0)||oldIndex==nowIndex){
                    simpleHtml = totalText.substring(0, oldIndex - leftEmpty) + openBtnHtml;
                    el.innerHTML = simpleHtml;
                    break;
                } else {
                    searchMin = nowIndex;
                }
                oldIndex = nowIndex;
            }
            document.body.removeChild(tempInput);
            //保存变量
            this._totalHtml = totalHtml;
            this._closeBtnHtml = closeBtnHtml;
            this._simpleHtml = simpleHtml;
        },
        {
            $click:function(event){
                //处理展开，收起事件
                event=core.wrapEvent(event);
                var target = event.target;
                if(dom.hasClass(target, "open-detail-btn")){
                    this._eMain.innerHTML = this._totalHtml + this._closeBtnHtml;
                }
                if(dom.hasClass(target, "close-detail-btn")){
                    this._eMain.innerHTML = this._simpleHtml;
                }
            }
        }
    );
}());

