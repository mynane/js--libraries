(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 在低版本ie上设置2x图片大小。
     * @private
     */
    function setImageSize() {
        var h = this.height;
        this.style.width = (this.width / 2) + 'px';
        this.style.height = (h / 2) + 'px';
    }

    /**
     * 初始化单选框控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Retina = core.inherits(
        ui.Control,
        '',
        function (el, options) {
            util.setDefault(options, 'capturable', false);

            if (ieVersion < 9) {
                dom.addClass(el, 'ui-retina');

                var style = dom.getStyle(el),
                    img = dom.create('', 'IMG');

                img.style.cssText = 'top:' + style.backgroundPositionY + ';left:' + style.backgroundPositionX;
                img.src = style.backgroundImage.replace(/(^url\("?|"?\)$)/g, '');
                if (img.complete) {
                    setImageSize.call(img);
                } else {
                    img.onload = setImageSize;
                }
                el.appendChild(img);
            }

            ui.Control.constructor.call(this, el, options);
        }
    );
}());
