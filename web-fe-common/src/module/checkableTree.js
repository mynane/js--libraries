/* checkstatus = {
-1: 全不选
0：部分选择
1：全部选择
}*/

ecui.ui.jingoal.checkableTree = ecui.inherits(ecui.ui.TreeView, 'ui-checkable-tree', {
    onclick: function (event) {
        ecui.ui.Control.prototype.$click.call(this, event);
        if (event.getControl() === this && this._eChildren) {
            if (this.isCollapsed()) {
                this.expand();
                ecui.triggerEvent(this, 'expand');
            } else {
                this.collapse();
                ecui.triggerEvent(this, 'collapse');
            }
        }
        event.preventDefault();
    }
});