/*
Progress - 定义进度显示的基本操作。
进度条控件，继承自基础控件，面向用户显示一个任务执行的程度。

进度条控件直接HTML初始化的例子:
<div ui="type:progress;rate:0.5"></div>

属性
_eText - 内容区域
_eMask - 完成的进度比例内容区域
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 初始化进度条控件。
     * options 对象支持的属性如下：
     * rate 初始的百分比
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Progress = core.inherits(
        ui.Control,
        'ui-progress',
        function (el, options) {
            ui.Control.constructor.call(this, el, options);

            var text = el.innerHTML;
            el.innerHTML = '<div class="' + options.classes.join('-text ') + '">' + text + '</div><div class="' + options.classes.join('-mask ') + '">' + text + '</div>';

            this._eText = el.firstChild;
            this._eMask = el.lastChild;
        },
        {
            /**
             * @override
             */
            $dispose: function () {
                this._eText = this._eMask = null;
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.Control.prototype.$ready.call(this, options);
                this.setRate(options.rate);
            },

            /**
             * 设置进度的比例以及需要显示的文本。
             * @public
             *
             * @param {number} rate 进度比例，在0-1之间
             * @param {string} text 显示的文本，如果省略将显示成 xx%
             */
            setRate: function (rate, text) {
                rate = Math.min(Math.max(0, rate), 1);
                if (text !== undefined) {
                    this._eText.innerHTML = this._eMask.innerHTML = text || Math.round(rate * 100) + '%';
                }
                this._eMask.style.clip = 'rect(0px,' + (rate * this.getWidth()) + 'px,' + this.getHeight() + 'px,0px)';
            }
        }
    );
//{if 0}//
}());
//{/if}//
