(function () {
    window.jingoal={};
    /**
     * 创建自定义事件
     * @decription 自定义事件容器
     */
    function CustomEvent() {
        this.handlers = {};
        CustomEvent.prototype.constructor = CustomEvent;
        //添加事件方法
        if (typeof this.addEvent !== 'function') {
            CustomEvent.prototype.addEvent = function (type, handler) {
                if (typeof this.handlers[type] !== 'function') {
                    this.handlers[type] = [];
                }
                this.handlers[type].push(handler);
            };
        }
        //添加事件方法
        if (typeof this.trigger !== 'function') {
            CustomEvent.prototype.trigger = function (event) {
                if (!event.target) {
                    event.target = this;
                }
                if (this.handlers[event.type] instanceof Array) {
                    var handlers = this.handlers[event.type], i, len;
                    for (i = 0, len = handlers.length; i < len; i++) {
                        handlers[i](event);
                    }
                }
            };
        }
        //移除事件方法
        if (typeof this.removeEvent !== 'function') {
            CustomEvent.prototype.removeEvent = function (type, handler) {
                if (this.handlers[type] instanceof Array) {
                    var handlers = this.handlers[type], i, len;
                    for (i = 0, len = handlers.length; i < len; i++) {
                        if (handlers[i] === handler) {
                            break;
                        }
                    }
                    handlers.splice(i, 1);
                }
            };
        }
    }
    jingoal.customEvent = CustomEvent;
}());
