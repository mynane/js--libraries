/*
TreeView - 定义树形视图的基本操作。
树视图控件，继承自基础控件，不可以被改变大小，可以包含普通子控件或者子树视图控件，普通子控件显示在它的文本区域，如果是子树视图控件，将在专门的子树视图控件区域显示。子树视图控件区域可以被收缩隐藏或是展开显示，默认情况下点击树视图控件就改变子树视图控件区域的状态。

树视图控件直接HTML初始化的例子:
<ul ui="type:tree-view;">
  <!-- 显示的文本，如果没有label整个内容就是节点的文本 -->
  <label>公司</label>
  <!-- 子控件 -->
  <li>董事会</li>
  <li>监事会</li>
  <ul>
    <label>总经理</label>
    <li>行政部</li>
    <li>人事部</li>
    <li>财务部</li>
    <li>市场部</li>
    <li>销售部</li>
    <li>技术部</li>
  </ul>
</ul>

属性
_bCollapsed    - 是否收缩子树
_eChildren     - 子控件区域Element对象
_aChildren     - 子控件集合
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var hovered;

    /**
     * 树视图控件刷新，根据子树视图控件的数量及显示的状态设置样式。
     * @private
     */
    function flush() {
        if (this._aChildren) {
            this.setClass(this.getPrimary() + (this._aChildren.length ? (this._bCollapsed ? '-collapsed' : '-expanded') : (!this._eChildren || this._bAutoType ? '-leaf' : '-empty')));
        }
    }

    /**
     * 建立子树视图控件。
     * @private
     *
     * @param {HTMLElement} el 子树的 Element 对象
     * @param {ecui.ui.TreeView} parent 父树视图控件
     * @param {Object} options 初始化选项，参见 create 方法
     * @return {ecui.ui.TreeView} 子树视图控件
     */
    function createChild(el, parent, options) {
        el.className += parent.constructor.CLASS;
        return core.$fastCreate(parent.constructor, el, null, util.extend(util.extend({}, options), core.getOptions(el) || {}));
    }

    /**
     * 初始化树视图控件。
     * options 对象支持的属性如下：
     * collapsed      子树区域是否收缩，默认为展开
     * autoType       是否自动根据子节点数量转换节点的状态(叶子节点/非叶子节点)
     * expandSelected 是否展开选中的节点，如果不自动展开，需要点击左部的小区域图标才有效，默认自动展开
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.TreeView = core.inherits(
        ui.Control,
        'ui-treeview',
        function (el, options) {
            if (el.tagName === 'UL') {
                var childrenEl = this._eChildren = el;
                el = dom.first(el);
                el.className = childrenEl.className;
                childrenEl.className = options.classes.join('-children ');
                dom.insertBefore(el, childrenEl);

                var list = dom.children(childrenEl);

                if (options.collapsed) {
                    dom.addClass(childrenEl, 'ui-hide');
                }
            }

            ui.Control.constructor.call(this, el, options);

            this._bCollapsed = !!options.collapsed;
            this._bAutoType = options.autoType;

            // 初始化子控件
            this._aChildren = list ? list.map(function (item) {
                item = createChild(item, this, options);
                item.$setParent(this);
                return item;
            }, this) : [];

            flush.call(this);
        },
        {
            /**
             * 控件点击时改变子树视图控件的显示/隐藏状态。
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);

                if (event.getControl() === this && this._eChildren) {
                    if (this.isCollapsed()) {
                        this.expand();
                        core.triggerEvent(this, 'expand');
                    } else {
                        this.collapse();
                        core.triggerEvent(this, 'collapse');
                    }
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eChildren = null;
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 隐藏树视图控件的同时需要将子树区域也隐藏。
             * @override
             */
            $hide: function () {
                ui.Control.prototype.$hide.call(this);

                if (this._eChildren) {
                    dom.addClass(this._eChildren, 'ui-hide');
                }
            },

            /**
             * @override
             */
            $mouseout: function (event) {
                ui.Control.prototype.$mouseout.call(this, event);

                var control = event.getControl();

                if (hovered) {
                    if (!this.contain(hovered)) {
                        return;
                    }
                    if (this.getRoot().contain(control)) {
                        control.alterClass('+nodehover');
                    } else {
                        control = null;
                    }
                    hovered.alterClass('-nodehover');
                    hovered = control;
                }
            },

            /**
             * @override
             */
            $mouseover: function (event) {
                ui.Control.prototype.$mouseover.call(this, event);

                if (hovered) {
                    if (this.contain(hovered)) {
                        return;
                    }
                    hovered.alterClass('-nodehover');
                }
                this.alterClass('+nodehover');
                hovered = this;
            },

            /**
             * 树视图控件改变位置时，需要将自己的子树区域显示在主元素之后。
             * @override
             */
            $setParent: function (parent) {
                var oldParent = this.getParent();

                if (oldParent) {
                    util.remove(oldParent._aChildren, this);
                    flush.call(oldParent);
                }

                ui.Control.prototype.$setParent.call(this, parent);

                // 将子树区域显示在主元素之后
                if (this._eChildren) {
                    dom.insertAfter(this._eChildren, this.getOuter());
                }
            },

            /**
             * 显示树视图控件的同时需要将子树视图区域也显示。
             * @override
             */
            $show: function () {
                ui.Control.prototype.$show.call(this);

                if (this._eChildren && !this._bCollapsed) {
                    dom.removeClass(this._eChildren, 'ui-hide');
                }
            },

            /**
             * 添加子树视图控件。
             * @public
             *
             * @param {string|ecui.ui.TreeView} item 子树视图控件的 html 内容/树视图控件
             * @param {number} index 子树视图控件需要添加的位置序号，不指定将添加在最后
             * @param {Object} options 子树视图控件初始化选项
             * @return {ecui.ui.TreeView} 添加的树视图控件
             */
            add: function (item, index, options) {
                var list = this._aChildren,
                    o;

                if ('string' === typeof item) {
                    o = dom.create('', 'LI');
                    o.innerHTML = item;
                    item = createChild(o, this, options);
                }

                // 这里需要先 setParent，否则 getRoot 的值将不正确
                if (!this._eChildren) {
                    this._eChildren = dom.create(this.getPrimary() + '-children ' + this.getType() + '-children', 'UL');
                    dom.insertAfter(this._eChildren, this.getOuter());
                }
                item.setParent(this);

                if (item.getParent()) {
                    o = item.getOuter();
                    util.remove(list, item);
                    if (list[index]) {
                        dom.insertBefore(o, list[index].getOuter());
                        list.splice(index, 0, item);
                    } else {
                        this._eChildren.appendChild(o);
                        list.push(item);
                    }
                    if (item._eChildren) {
                        dom.insertAfter(item._eChildren, o);
                    }
                }

                flush.call(this);

                return item;
            },

            /**
             * 收缩当前树视图控件的子树区域。
             * @public
             */
            collapse: function () {
                if (this._eChildren && !this._bCollapsed) {
                    this._bCollapsed = true;
                    dom.addClass(this._eChildren, 'ui-hide');
                    flush.call(this);
                }
            },

            /**
             * 展开当前树视图控件的子树区域。
             * @public
             */
            expand: function () {
                if (this._eChildren && this._bCollapsed) {
                    this._bCollapsed = false;
                    dom.removeClass(this._eChildren, 'ui-hide');
                    flush.call(this);
                }
            },

            /**
             * 获取当前树视图控件的所有子树视图控件。
             * @public
             *
             * @return {Array} 树视图控件列表
             */
            getChildren: function () {
                return this._aChildren.slice();
            },

            /**
             * 获取当前树视图控件的根控件。
             * @public
             *
             * @return {ecui.ui.TreeView} 树视图控件的根控件
             */
            getRoot: function () {
                // 这里需要考虑Tree位于上一个Tree的节点内部
                for (var o = this, parent; (parent = o.getParent()) instanceof ui.TreeView && parent._aChildren.indexOf(o) >= 0; o = parent) {}
                return o;
            },

            /**
             * 当前子树区域是否收缩。
             * @public
             *
             * @return {boolean} true 表示子树区域收缩，false 表示子树区域展开
             */
            isCollapsed: function () {
                return !this._eChildren || this._bCollapsed;
            }
        }
    );
}());
