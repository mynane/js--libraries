/*
Button - 定义按钮的基本操作。
按钮控件，继承自基础控件，屏蔽了激活状态的向上冒泡，并且在激活(active)状态下鼠标移出控件区域会失去激活样式，移入控件区域再次获得激活样式，按钮控件中的文字不可以被选中。

按钮控件直接HTML初始化的例子:
<div ui="type:button">
  <!-- 这里放按钮的文字 -->
  ...
</div>
或
<button ui="type:button">
  <!-- 这里放按钮的文字 -->
  ...
</button>
或
<input ui="type:button" value="按钮文字" type="button">

属性
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 初始化基础控件。
     * options 对象支持的属性如下：
     * text 按钮的文字
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Button = core.inherits(
        ui.Control,
        'ui-button',
        function (el, options) {
            util.setDefault(options, 'userSelect', false);

            if (options.text) {
                dom.setText(el, options.text);
            }

            ui.Control.constructor.call(this, el, options);
        },
        {
            /**
             * 按钮控件获得激活时需要阻止事件的冒泡。
             * @override
             */
            $activate: function (event) {
                ui.Control.prototype.$activate.call(this, event);
                event.stopPropagation();
            },

            /**
             * 如果控件处于激活状态，移除状态样式 -active，移除状态样式不失去激活状态。
             * @override
             */
            $mouseout: function (event) {
                ui.Control.prototype.$mouseout.call(this, event);
                if (this.isActived()) {
                    this.alterClass('-active');
                }
            },

            /**
             * 如果控件处于激活状态，添加状态样式 -active。
             * @override
             */
            $mouseover: function (event) {
                ui.Control.prototype.$mouseover.call(this, event);
                if (this.isActived()) {
                    this.alterClass('+active');
                }
            }
        }
    );
//{if 0}//
}());
//{/if}//
