/*
Radio - 定义一组选项中选择唯一选项的基本操作。
单选框控件，继承自输入框控件，实现了对原生 InputElement 单选框的功能扩展，支持对选中的图案的选择。单选框控件适用所有在一组中只允许选择一个目标的交互，并不局限于此分组的表现形式(文本、图片等)。

单选框控件直接HTML初始化的例子:
<input ui="type:radio" name="city" value="beijing" checked="checked" type="radio">
或
<div ui="type:radio;name:city;value:beijing;checked:true"></div>
或
<div ui="type:radio">
  <input name="city" value="beijing" checked="checked" type="radio">
</div>

属性
_bDefault  - 默认的选中状态
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 单选框控件刷新。
     * @private
     *
     * @param {boolean} checked 新的状态，如果忽略表示不改变当前状态
     */
    function flush(checked) {
        if (checked !== undefined) {
            var el = this.getInput();
            el.defaultChecked = el.checked = checked;
        }
        this.setClass(this.getPrimary() + (this.isChecked() ? '-checked' : ''));
    }

    /**
     * 初始化单选框控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Radio = core.inherits(
        ui.InputControl,
        'ui-radio',
        function (el, options) {
            util.setDefault(options, 'hidden', true);
            util.setDefault(options, 'inputType', 'radio');

            ui.InputControl.constructor.call(this, el, options);

            // 保存节点选中状态，用于修复IE6/7下移动DOM节点时选中状态发生改变的问题
            this._bDefault = this.getInput().defaultChecked;
        },
        {
            /**
             * 控件点击时将控件设置成为选中状态，同时取消同一个单选框控件组的其它控件的选中状态。
             * @override
             */
            $click: function (event) {
                ui.InputControl.prototype.$click.call(this, event);
                this.setChecked(true);
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keydown: function (event) {
                ui.InputControl.prototype.$keydown.call(this, event);
                if (event.which === 32) {
                    event.preventDefault();
                }
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keypress: function (event) {
                ui.InputControl.prototype.$keypress.call(this, event);
                if (event.which === 32) {
                    event.preventDefault();
                }
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keyup: function (event) {
                ui.InputControl.prototype.$keyup.call(this, event);
                if (event.which === 32) {
                    if (core.getKey() === 32) {
                        this.setChecked(true);
                    }
                    event.preventDefault();
                }
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.InputControl.prototype.$ready.call(this, options);
                flush.call(this);
            },

            /**
             * @override
             */
            $reset: function (event) {
                // 修复IE6/7下移动DOM节点时选中状态发生改变的问题
                this.getInput().checked = this._bDefault;
                ui.InputControl.prototype.$reset.call(this, event);
            },

            /**
             * 获取与当前单选框同组的全部单选框。
             * getItems 方法返回包括当前单选框在内的与当前单选框同组的全部单选框，同组的单选框选中状态存在唯一性。
             * @public
             *
             * @return {Array} 单选框控件数组
             */
            getItems: function () {
                var inputEl = this.getInput(),
                    result = [];

                if (!inputEl.name) {
                    return [this];
                }
                if (inputEl.form) {
                    // 必须 name 也不为空，否则 form[o] 的值在部分浏览器下将是空
                    Array.prototype.forEach.call(inputEl.form[inputEl.name], function (item) {
                        if (item.getControl) {
                            result.push(item.getControl());
                        }
                    });
                    return result;
                }
                return core.query({type: ui.Radio, custom: function (control) {
                    return !control.getInput().form && control.getName() === inputEl.name;
                }});
            },

            /**
             * 判断控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return this.getInput().checked;
            },

            /**
             * 设置单选框控件选中状态。
             * 将控件设置成为选中状态，会取消同一个单选框控件组的其它控件的选中状态。
             * @public
             *
             * @param {boolean} checked 是否选中
             */
            setChecked: function (checked) {
                if (this.isChecked() !== checked) {
                    if (checked) {
                        this.getItems().forEach(function (item) {
                            flush.call(item, item === this);
                        }, this);
                    } else {
                        flush.call(this, false);
                    }
                }
            }
        }
    );
}());
