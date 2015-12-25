/*
MessageBox - 消息框功能。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var instance,
        buttonInstances = [];

    /**
     * 消息框点击事件处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function onclick(event) {
        instance.hide();
        if (this._fAction) {
            this._fAction.call(window, event);
        }
    }

    /**
     * 消息框显示提示信息，仅包含确认按钮。
     * @protected
     *
     * @param {string} text 提示信息文本
     * @param {Array} buttonTexts 按钮的文本数组
     * @param {Function} ... 按钮的点击事件处理函数，顺序与参数中按钮文本定义的顺序一致
     */
    core.$messagebox = function (text, buttonTexts) {
        if (!instance) {
            instance = core.create(ui.Dialog, {main: dom.create('ui-messagebox'), hide: true, parent: document.body});
            instance.getBody().innerHTML = '<div class="ui-messagebox-text"></div><div class="ui-messagebox-buttons"></div>';
        }

        var el = instance.getBody().firstChild;

        if (!instance.isShow()) {
            for (; buttonTexts.length > buttonInstances.length; ) {
                buttonInstances.push(core.create(ui.Button, {element: dom.create('', 'SPAN'), parent: el.nextSibling}));
            }

            el.innerHTML = text;

            buttonInstances.forEach(function (item, index) {
                if (index < buttonTexts.length) {
                    item.setContent(buttonTexts[index]);
                    item.show();
                } else {
                    item.hide();
                }
                item._fAction = arguments[index + 2];
                item.onclick = onclick;
            });

            instance.showModal(0);
        }
    };

    /**
     * 消息框显示提示信息，仅包含确认按钮。
     * @public
     *
     * @param {string} text 提示信息文本
     * @param {Function} onok 确认按钮点击事件处理函数
     */
    core.alert = function (text, onok) {
        core.$messagebox(text, ['确定'], onok);
        return instance;
    };

    /**
     * 消息框显示提示信息，包含确认/取消按钮。
     * @public
     *
     * @param {string} text 提示信息文本
     * @param {Function} onok 确认按钮点击事件处理函数
     * @param {Function} oncancel 取消按钮点击事件处理函数
     */
    core.confirm = function (text, onok, oncancel) {
        core.$messagebox(text, ['确定', '取消'], onok, oncancel);
        return instance;
    };
}());
