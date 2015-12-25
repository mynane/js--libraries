/*
CheckTree - 定义包含复选框的树形结构的基本操作。
包含复选框的树控件，继承自树控件。每一个选项包含一个复选框进行选择，除非特别的指定，否则子节点的复选框与父节点的复选框
自动联动。

树控件直接HTML初始化的例子:
<div ui="type:check-tree;fold:true;id:parent;name:part">
    <!-- 当前节点的文本，如果没有整个内容就是节点的文本 -->
    <label>节点的文本</label>
    <!-- 这里放子控件，如果需要fold某个子控件，将子控件的style="display:none"即可 -->
    <li ui="subject:other">子控件文本</li>
    <li ui="subject:true">直接关联父节点树的checkbox</li>
    <li>子控件文本(复选框默认与父控件复选框联动)</li>
    ...
</div>

属性
_oSuperior - 关联的父复选框控件ID，默认与父控件复选框关联
_uCheckbox - 复选框控件
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 初始化复选树控件。
     * options 对象支持的属性如下：
     * name 复选框的表单项的默认名称
     * value 复选框的表单项的值
     * subject 父复选框的标识，如果为true表示自动使用上级树节点作为父复选框，其它等价false的值表示不联动
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.CheckTree = core.inherits(
        ui.TreeView,
        'ui-checktree',
        function (el, options) {
            ui.TreeView.constructor.call(this, el, options);

            this._oSubject = options.subject;

            for (var i = 0, checkbox = this._uCheckbox = core.$fastCreate(ui.Checkbox, el.insertBefore(dom.create('ui-checkbox ' + this.getPrimary() + '-checkbox'), el.firstChild), this, options), list = this.getChildren(); el = list[i++]; ) {
                if (options = el._oSubject) {
                    el = el._uCheckbox;
                    if (options === true) {
                        el.setSubject(checkbox);
                    } else {
                        core.delegate(options, el, el.setSubject);
                    }
                }
            }
        },
        {
            /**
             * 计算控件的缓存。
             * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
             * @protected
             *
             * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
             * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
             */
            $cache: function (style, cacheSize) {
                ui.TreeView.prototype.$cache.call(this, style, cacheSize);
                this._uCheckbox.cache(true, true);
            },

            /**
             * 控件渲染完成后初始化的默认处理。
             * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
             * @protected
             */
            $init: function () {
                ui.TreeView.prototype.$init.call(this);
                this._uCheckbox.$init();
            },

            /**
             * 获取包括当前树控件在内的全部选中的子树控件。
             * @public
             *
             * @return {Array} 全部选中的树控件列表
             */
            getChecked: function () {
                for (var i = 0, list = this.getChildren(), result = this.isChecked() ? [this] : [], o; o = list[i++]; ) {
                    result = result.concat(o.getChecked());
                }
                return result;
            },

            /**
             * 获取当前树控件复选框的表单项的值。
             * @public
             *
             * @return {string} 表单项的值
             */
            getValue: function () {
                return this._uCheckbox.getValue();
            },

            /**
             * 判断树控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return this._uCheckbox.isChecked();
            },

            /**
             * 设置当前树控件复选框选中状态。
             * @public
             *
             * @param {boolean} 是否选中当前树控件复选框
             */
            setChecked: function (status) {
                this._uCheckbox.setChecked(status);
            }
        }
    );
//{if 0}//
}());
//{/if}//