/*
Decorate - 装饰器插件。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        ui = core.ui,
        util = core.util,

        isStrict = document.compatMode === 'CSS1Compat',
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 装饰器插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数
     */
    var decorates = ext.decorate = function (control, value) {
        value.replace(
            /([A-Za-z0-9\-]+)\s*\(\s*([^)]+)\)/g,
            function ($0, $1, $2) {
                // 获取装饰器函数
                var Decorate = decorates[util.toCamelCase($1.charAt(0).toUpperCase() + $1.slice(1))];

                // 获取需要调用的装饰器列表
                $2 = $2.split(/\s+/);
                // 以下使用 el 计数
                for (var i = 0; $0 = $2[i++]; ) {
                    $1 = new Decorate(control, $0);
                }
            }
        );
    };

    /**
     * 初始化装饰器，将其附着在控件外围。
     * @public
     *
     * @param {ecui.ui.Control|ecui.ext.decorate.Decorator} control 需要装饰的控件
     * @param {string} primary 装饰器的基本样式
     * @param {Array} list 需要生成的区块样式名称集合
     */
    var DECORATOR = decorates.Decorator = function (control, primary, list) {
            var id = control.getUID(),
                o = (this._oInner = DECORATOR[id] || control).getOuter();

            dom.insertBefore(this._eMain = dom.create(this._sPrimary = primary), o).appendChild(o);
            core.$bind(this._eMain, control);
            control.clearCache();

            DECORATOR[id] = this;

            if (!DECORATOR_OLD_METHODS[id]) {
                // 给控件的方法设置代理访问
                id = DECORATOR_OLD_METHODS[id] = {};
                for (o in DECORATOR_PROXY) {
                    id[o] = control[o];
                    control[o] = DECORATOR_PROXY[o];
                }
            }

            if (list) {
                for (id = 0; o = list[id]; ) {
                    list[id++] = '<div class="' + primary + '-' + o + '" style="position:absolute;top:0px;left:0px"></div>';
                }

                dom.insertHTML(this._eMain, 'BEFOREEND', list.join(''));
            }
        },
        DECORATOR_CLASS = DECORATOR.prototype,

        DECORATOR_PROXY = {},
        DECORATOR_OLD_METHODS = {};

    /**
     * 清除所有的装饰器效果，同时清除所有的代理函数。
     * @public
     *
     * @param {ecui.ui.Control} control ECUI 控件
     */
    DECORATOR.clear = function (control) {
        var id = control.getUID(),
            o;

        // 清除所有的代理函数
        for (o in DECORATOR_PROXY) {
            delete control[o];

            // 方法不在原型链上需要额外恢复
            if (control[o] !== DECORATOR_OLD_METHODS[id][o]) {
                control[o] = DECORATOR_OLD_METHODS[id][o];
            }
        }

        o = DECORATOR[id];

        dom.insertBefore(control.getOuter(), o._eMain);
        dom.remove(o._eMain);
        for (; o !== control; o = o._oInner) {
            o.$dispose();
        }
        delete DECORATOR[id];
        delete DECORATOR_OLD_METHODS[id];
    };

    /**
     * 缓存装饰器的属性。
     * @protected
     *
     * @param {CssStyle} style 主元素的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件的大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    DECORATOR_CLASS.$cache = function (style, cacheSize) {
        this._oInner.$cache(style, cacheSize, true);
        ui.Control.prototype.$cache.call(this, dom.getStyle(this._eMain), false);
        this._oInner.$$position = 'relative';
        this.$$position = style.position === 'absolute' ? 'absolute' : 'relative';
        this.$$layout = ';top:' + style.top + ';left:' + style.left + ';display:' + style.display + (ieVersion ? ';zoom:' + style.zoom : '');
    };

    /**
     * 销毁装饰器的默认处理。
     * @protected
     */
    DECORATOR_CLASS.$dispose = function () {
        this._eMain = null;
    };

    /**
     * 装饰器大小变化事件的默认处理。
     * @protected
     */
    DECORATOR_CLASS.$resize = function () {
        var style = this._eMain.style;

        style.width = '';
        if (!ieVersion) {
            style.height = '';
        }
        this._oInner.$resize(true);
    };

    /**
     * 设置装饰器的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    DECORATOR_CLASS.$setSize = function (width, height) {
        var style = this._eMain.style,
            inner = this._oInner,
            invalidWidth = ui.Control.prototype.$getBasicWidth.call(this),
            invalidHeight = ui.Control.prototype.$getBasicHeight.call(this);

        inner.$setSize(width && width - invalidWidth, height && height - invalidHeight, true);

        style.width = inner.getWidth(true) + (isStrict ? invalidWidth : 0) + 'px';
        style.height = inner.getHeight(true) + (isStrict ? invalidHeight : 0) + 'px';
    };

    /**
     * 为装饰器添加/移除一个扩展样式。
     * @public
     *
     * @param {string} className 扩展样式名，以+号开头表示添加扩展样式，以-号开头表示移除扩展样式
     */
    DECORATOR_CLASS.alterClass = function (className) {
        var flag = className.charAt(0) === '+';

        this._oInner.alterClass(className, true);

        if (flag) {
            className = '-' + className.slice(1);
        }

        (flag ? dom.addClass : dom.removeClass)(this._eMain, this._sPrimary + className);
    };

    /**
     * 获取装饰器的当前样式。
     * @public
     *
     * @return {string} 控件的当前样式
     */
    DECORATOR_CLASS.getClass = function () {
        return this._sPrimary;
    };

    /**
     * 获取装饰器区域的高度。
     * @public
     *
     * @return {number} 装饰器的高度
     */
    DECORATOR_CLASS.getHeight = function () {
        return this._oInner.getHeight(true) + ui.Control.prototype.$getBasicHeight.call(this);
    };

    /**
     * 获取装饰器的最小高度。
     * @public
     *
     * @return {number} 装饰器的最小高度
     */
    DECORATOR_CLASS.getMinimumHeight = function () {
        return this._oInner.getMinimumHeight(true) + ui.Control.prototype.$getBasicHeight.call(this);
    };

    /**
     * 获取装饰器的最小宽度。
     * @public
     *
     * @return {number} 装饰器的最小宽度
     */
    DECORATOR_CLASS.getMinimumWidth = function () {
        return this._oInner.getMinimumWidth(true) + ui.Control.prototype.$getBasicWidth.call(this);
    };

    /**
     * 获取装饰器的外层元素。
     * @public
     *
     * @return {HTMLElement} Element 对象
     */
    DECORATOR_CLASS.getOuter = function () {
        return this._eMain;
    };

    /**
     * 获取装饰器区域的宽度。
     * @public
     *
     * @return {number} 装饰器的宽度
     */
    DECORATOR_CLASS.getWidth = function () {
        return this._oInner.getWidth(true) + ui.Control.prototype.$getBasicWidth.call(this);
    };

    /**
     * 装饰器初始化。
     * @public
     */
    DECORATOR_CLASS.init = function (options) {
        this._eMain.style.cssText = 'position:' + this.$$position + this.$$layout;
        this._oInner.getOuter(true).style.cssText += ';position:relative;top:auto;left:auto;display:block';
        this._oInner.init(options, true);
    };

    /**
     * 销毁控件的默认处理。
     * 控件销毁时需要先销毁装饰器。
     * @protected
     */
    DECORATOR_PROXY.$dispose = function () {
        DECORATOR.clear(this);
        this.$dispose();
    };

    (function () {
        function build(name, index) {
            DECORATOR_PROXY[name] = function () {
                var id = this.getUID(),
                    o = DECORATOR[id],
                    args = arguments;

                return args[index] ? DECORATOR_OLD_METHODS[id][name].apply(this, args) : o[name].apply(o, args);
            };
        }

        // 这里批量生成函数代理
        for (var i = 0, names = [['$cache', 2], ['$resize', 0], ['$setSize', 2], ['alterClass', 1], ['getOuter', 0], ['getMinimumWidth', 0], ['getMinimumHeight', 0], ['getWidth', 0], ['getHeight', 0], ['init', 1]]; i < 10; ) {
            // 如果是代理进入的，会多出来一个参数作为标志位
            build(names[i][0], names[i++][1]);
        }
    }());
/*
LRDecorator - 左右扩展装饰器，将区域分为"左-控件-右"三部分，使用paddingLeft与paddingRight作为左右区域的宽度
*/
    /**
     * 初始化左右扩展装饰器，将其附着在控件外围。
     * @public
     *
     * @param {Control} control 需要装饰的控件
     * @param {string} primary 装饰器的基本样式
     */
    decorates.LRDecorator = function (control, primary) {
        DECORATOR.call(this, control, primary, ['left', 'right']);
    };

    /**
     * 设置装饰器区域的大小
     * @public
     *
     * @param {number} width 装饰器区域的宽度
     * @param {number} height 装饰器区域的高度
     */
    util.inherits(decorates.LRDecorator, DECORATOR).$setSize = function (width, height) {
        DECORATOR_CLASS.$setSize.call(this, width, height);

        var o = this._eMain.lastChild,
            text = ';top:' + this.$$padding[0] + 'px;height:' + this._oInner.getHeight(true) + 'px;width:';

        o.style.cssText += text + this.$$padding[1] + 'px;left:' + (this.$$padding[3] + this._oInner.getWidth(true)) + 'px';
        o.previousSibling.style.cssText += text + this.$$padding[3] + 'px';
    };

/*
TBDecorator - 上下扩展装饰器，将区域分为"上-控件-下"三部分，使用paddingTop与paddingBottom作为上下区域的高度
*/
        /**
         * 初始化上下扩展装饰器，将其附着在控件外围。
         * @public
         *
         * @param {Control} control 需要装饰的控件
         * @param {string} primary 装饰器的基本样式
         */
    decorates.TBDecorator = function (control, primary) {
        DECORATOR.call(this, control, primary, ['top', 'bottom']);
    };

    /**
     * 设置装饰器区域的大小
     * @public
     *
     * @param {number} width 装饰器区域的宽度
     * @param {number} height 装饰器区域的高度
     */
    util.inherits(decorates.TBDecorator, DECORATOR).$setSize = function (width, height) {
        DECORATOR_CLASS.$setSize.call(this, width, height);

        var o = this._eMain.lastChild,
            text = ';left:' + this.$$padding[3] + 'px;width:' + this._oInner.getWidth(true) + 'px;height:';

        o.style.cssText += text + this.$$padding[2] + 'px;top:' + (this.$$padding[0] + this._oInner.getHeight(true)) + 'px';
        o.previousSibling.style.cssText += text + this.$$padding[0] + 'px';
    };

/*
MagicDecorator - 九宫格扩展装饰器，将区域分为"左上-上-右上-左-控件-右-左下-下-右下"九部分，使用padding定义宽度与高度
*/
    /**
     * 初始化九宫格扩展装饰器，将其附着在控件外围。
     * @public
     *
     * @param {Control} control 需要装饰的控件
     * @param {string} primary 装饰器的基本样式
     */
    decorates.MagicDecorator = function (control, primary) {
        DECORATOR.call(this, control, primary, ['widget0', 'widget1', 'widget2', 'widget3', 'widget5', 'widget6', 'widget7', 'widget8']);
    };

    /**
     * 设置装饰器区域的大小
     * @public
     *
     * @param {number} width 装饰器区域的宽度
     * @param {number} height 装饰器区域的高度
     */
    util.inherits(decorates.MagicDecorator, DECORATOR).$setSize = function (width, height) {
        DECORATOR_CLASS.$setSize.call(this, width, height);

        var o = this._eMain.lastChild,
            i = 9,
            paddingTop = this.$$padding[0],
            paddingLeft = this.$$padding[3],
            widthList = this._oInner.getWidth(true),
            heightList = this._oInner.getHeight(true),
            topList = [0, paddingTop, paddingTop + heightList],
            leftList = [0, paddingLeft, paddingLeft + widthList];

        widthList = [paddingLeft, widthList, this.$$padding[1]];
        heightList = [paddingTop, heightList, this.$$padding[2]];

        for (; i--; ) {
            if (i !== 4) {
                o.style.cssText += ';top:' + topList[Math.floor(i / 3)] + 'px;left:' + leftList[i % 3] + 'px;width:' + widthList[i % 3] + 'px;height:' + heightList[Math.floor(i / 3)] + 'px';
                o = o.previousSibling;
            }
        }
    };
}());
