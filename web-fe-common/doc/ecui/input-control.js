/*
InputControl - 定义输入数据的基本操作。
输入控件，继承自基础控件，实现了对原生 InputElement 的功能扩展，包括光标的控制、输入事件的实时响应(每次改变均触发事件)，以及 IE 下不能动态改变输入框的表单项名称的模拟处理。

输入控件直接HTML初始化的例子:
<input ui="type:input-control" type="password" name="passwd" value="1111">
或:
<div ui="type:input-control;name:passwd;value:1111;inputType:password"></div>
或:
<div ui="type:input-control">
  <input type="password" name="passwd" value="1111">
</div>

属性
_bHidden       - 输入框是否隐藏
_eInput        - INPUT对象
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    var Events = {
        /**
         * 输入框失去焦点事件处理函数。
         * @private
         */
        blur: function (event) {
            var control = core.wrapEvent(event).target.getControl();
            // INPUT失去焦点，但控件未失去焦点，不需要触发blur
            if (core.getFocused() === control) {
                control.blur();
            }
        },

        /**
         * 拖拽内容到输入框时处理函数。
         * 为了增加可控性，阻止该行为。[todo] firefox下无法阻止，后续升级
         * @private
         *
         * @param {Event} event 事件对象
         */
        dragover: function (event) {
            core.wrapEvent(event).exit();
        },

        /**
         * 拖拽内容到输入框时处理函数。
         * 为了增加可控性，阻止该行为。[todo] firefox下无法阻止，后续升级
         * @private
         *
         * @param {Event} event 事件对象
         */
        drop: function (event) {
            core.wrapEvent(event).exit();
        },

        /**
         * 输入框获得焦点事件处理函数。
         * @private
         */
        focus: function (event) {
            core.wrapEvent(event).target.getControl().focus();
        },

        /**
         * 输入框输入内容事件处理函数。
         * @private
         */
        input: function (event) {
            core.triggerEvent(core.wrapEvent(event).target.getControl(), 'change');
        },

        /**
         * 输入框输入内容事件处理函数，兼容IE6-8。
         * @private
         *
         * @param {Event} event 事件对象
         */
        propertychange: function (event) {
            if (ieVersion < 9) {
                if (event.propertyName === 'value' && core.wrapEvent(event).target.type !== 'hidden') {
                    core.triggerEvent(core.wrapEvent(event).target.getControl(), 'change');
                }
            }
        }
    };

    /**
     * 表单提交事件处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function submitForm(event) {
        event = core.wrapEvent(event);

        Array.prototype.forEach.call(this.elements, function (item) {
            if (item.getControl) {
                core.triggerEvent(item.getControl(), 'submit', event);
            }
        });
    }

    /**
     * 表单复位事件处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function resetForm(event) {
        event = core.wrapEvent(event);

        // 复位的处理延后执行，是为了能读取复位后的值
        util.timer(function () {
            Array.prototype.forEach.call(this.elements, function (item) {
                if (item.getControl) {
                    core.triggerEvent(item.getControl(), 'reset', event);
                }
            });
        });
    }

    /**
     * 为控件的 INPUT 节点绑定事件。
     * @private
     */
    function bindEvent() {
        core.$bind(this._eInput, this);
        if (!this._bHidden) {
            // 对于IE或者textarea的变化，需要重新绑定相关的控件事件
            for (var name in Events) {
                if (Events.hasOwnProperty(name)) {
                    dom.addEventListener(this._eInput, name, Events[name]);
                }
            }
        }
    }

    /**
     * 初始化输入控件。
     * options 对象支持的属性如下：
     * name         输入框的名称
     * value        输入框的默认值
     * checked      输入框是否默认选中(radio/checkbox有效)
     * inputType    输入框的类型，默认为 text
     * hidden       输入框是否隐藏，隐藏状态下将不会绑定键盘事件
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.InputControl = core.inherits(
        ui.Control,
        'ui-input',
        function (el, options) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                // 根据表单项初始化
                var inputEl = el;
                el = dom.insertBefore(dom.create(el.className), el);
                inputEl.className = '';
                el.appendChild(inputEl);
            } else {
                inputEl = el.getElementsByTagName('INPUT')[0] || el.getElementsByTagName('TEXTAREA')[0];
                if (!inputEl) {
                    inputEl = dom.setInput(null, options.name, options.inputType);
                    inputEl.defaultValue = inputEl.value = options.value || '';
                    el.appendChild(inputEl);
                }
            }
            if (options.hidden) {
                dom.addClass(inputEl, 'ui-hide');
            }
            if (options.checked) {
                inputEl.defaultChecked = inputEl.checked = true;
            }

            ui.Control.constructor.call(this, el, options);

            this._bHidden = options.hidden;
            this._eInput = inputEl;
            bindEvent.call(this);
        },
        {
            /**
             * 输入框内容改变事件的默认处理。
             * @protected
             */
            $change: util.blank,

            /**
             * @override
             */
            $blur: function (event) {
                ui.Control.prototype.$blur.call(this, event);

                dom.removeEventListener(this._eInput, 'blur', Events.blur);
                try {
                    this._eInput.blur();
                } catch (ignore) {
                }
                dom.addEventListener(this._eInput, 'blur', Events.blur);
            },

            /**
             * @override
             */
            $dispose: function () {
                if (this && this._eInput) {
                    this._eInput.getControl = null;
                    this._eInput = null;
                }
                ui.Control.prototype.$dispose.call(this);
            },

            $focus: function (event) {
                ui.Control.prototype.$focus.call(this, event);

                dom.removeEventListener(this._eInput, 'focus', Events.focus);
                try {
                    this._eInput.focus();
                } catch (ignore) {
                }
                dom.addEventListener(this._eInput, 'focus', Events.focus);
            },

            /**
             * 输入重置事件的默认处理。
             * @protected
             *
             * @param {Event} event 事件对象
             */
            $reset: function () {
                this.$ready();
            },

            /**
             * @override
             */
            $setParent: function (parent) {
                ui.Control.prototype.$setParent.call(this, parent);
                if (parent = this._eInput.form) {
                    if (!parent.getControl) {
                        dom.addEventListener(parent, 'submit', submitForm);
                        dom.addEventListener(parent, 'reset', resetForm);
                        parent.getControl = util.blank;
                    }
                }
            },

            /**
             * @override
             */
            $setSize: function (width, height) {
                ui.Control.prototype.$setSize.call(this, width, height);
                this._eInput.style.width = this.getBodyWidth() + 'px';
                this._eInput.style.height = this.getBodyHeight() + 'px';
            },

            /**
             * 输入提交事件的默认处理。
             * @protected
             *
             * @param {Event} event 事件对象
             */
            $submit: util.blank,

            /**
             * 输入控件获得失效需要设置输入框不提交。
             * @override
             */
            disable: function () {
                if (ui.Control.prototype.disable.call(this)) {
                    var body = this.getBody();

                    if (this._bHidden) {
                        this._eInput.disabled = true;
                    } else {
                        body.removeChild(this._eInput);
                        if (this._eInput.type !== 'password') {
                            // 如果输入框是密码框需要直接隐藏，不允许将密码显示在浏览器中
                            body.innerHTML = util.encodeHTML(this._eInput.value);
                        }
                    }

                    return true;
                }
                return false;
            },

            /**
             * 输入控件解除失效需要设置输入框可提交。
             * @override
             */
            enable: function () {
                if (ui.Control.prototype.enable.call(this)) {
                    var body = this.getBody();

                    if (this._bHidden) {
                        this._eInput.disabled = false;
                    } else {
                        body.innerHTML = '';
                        body.appendChild(this._eInput);
                    }

                    return true;
                }
                return false;
            },

            /**
             * 获取控件的输入元素。
             * @public
             *
             * @return {HTMLElement} InputElement 对象
             */
            getInput: function () {
                return this._eInput;
            },

            /**
             * 获取控件的名称。
             * 输入控件可以在表单中被提交，getName 方法返回提交时用的表单项名称，表单项名称可以使用 setName 方法改变。
             * @public
             *
             * @return {string} INPUT 对象名称
             */
            getName: function () {
                return this._eInput.name;
            },

            /**
             * 获取控件的值。
             * getValue 方法返回提交时表单项的值，使用 setValue 方法设置。
             * @public
             *
             * @return {string} 控件的值
             */
            getValue: function () {
                return this._eInput.value;
            },

            /**
             * 设置控件的名称。
             * 输入控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
             * @public
             *
             * @param {string} name 表单项名称
             */
            setName: function (name) {
                var el = dom.setInput(this._eInput, name || '');
                if (this._eInput !== el) {
                    bindEvent.call(this);
                    this._eInput = el;
                }
            },

            /**
             * 设置控件的值。
             * setValue 方法设置提交时表单项的值，使用 getValue 方法获取设置的值。
             * @public
             *
             * @param {string} value 控件的值
             */
            setValue: function (value) {
                var func = Events.propertychange;

                // 停止事件，避免重入引发死循环
                if (func) {
                    dom.removeEventListener(this._eInput, 'propertychange', func);
                }
                this._eInput.value = value;
                if (func) {
                    dom.addEventListener(this._eInput, 'propertychange', func);
                }
            }
        }
    );
}());
