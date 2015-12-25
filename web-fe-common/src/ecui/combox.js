/*
Combox - 定义可输入下拉框行为的基本操作。
可输入下拉框控件，继承自下拉框控件，在下拉框控件的基础上允许选项框可输入内容。

可输入下拉框控件直接HTML初始化的例子:
<select ui="type:combox" name="age">
  <option value="20">20</option>
  <option value="21" selected="selected">21</option>
  <option value="22">22</option>
</select>
或
<div ui="type:combox;name:age;value:21">
  <div ecui="value:20">20</div>
  <div ecui="value:21">21</div>
  <div ecui="value:22">22</div>
</div>

如果需要自定义特殊的选项效果，请按下列方法初始化:
<div ui="type:combox">
    <!-- 如果ec中不指定name，也可以在input中指定 -->
    <input name="test" />
    <!-- 这里放选项内容 -->
    <li value="值">文本</li>
    ...
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 初始化可输入下拉框控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Combox = core.inherits(
        ui.Select,
        '*ui-combox',
        function (el, options) {
            util.setDefault(options, 'hidden', false);
            ui.Select.constructor.call(this, el, options);
        },
        {
            /**
             * 设置控件的大小。
             * @protected
             *
             * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
             * @param {number} height 高度，如果不需要设置则省略此参数
             */
            $setSize: function (width, height) {
                ui.Select.prototype.$setSize.call(this, width, height);
                this.getInput().style.width = this.$getSection('Text').getWidth() + 'px';
            }
        }
    );
}());
