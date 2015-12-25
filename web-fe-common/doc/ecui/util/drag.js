(function () {
    var dom = ecui.dom;

    function CreateDrag(isStart) {
        var dragdrop = new jingoal.customEvent();
        var dragging = null;
        var html = document.documentElement,
            isIE6 = !('minWidth' in html.style),
            isLosecapture = !isIE6 && ('onlosecapture' in html),
            isSetCapture = 'setCapture' in html;
        function dragend(event) {
            if (dragging !== null) {
                event.preventDefault();
                event.stopPropagation();
                if (isSetCapture) {
                    dragging.releaseCapture();
                }
                if (isLosecapture) {
                    dom.addEventListener(dragging, 'losecapture', dragend);
                } else {
                    dom.addEventListener(window, 'blur', dragend);
                }
                document.body.onselectstart = null;
                dragdrop.trigger({
                    type: 'dragend',
                    target: dragging,
                    x: event.pageX,
                    y: event.pageY
                });
                dragging = null;
            }
        }
        function handlerEvent(event) {
            event=ecui.wrapEvent(event);
            var target = event.target, _handlerFunc = {
                'mousedown' : function (event) {
                    if (isStart(target)) {
                        event.preventDefault();
                        event.stopPropagation();
                        target.ondragstart = function () {
                            return false;
                        };
                        target.onselectstart = function () {
                            return false;
                        };
                        document.body.onselectstart = function () {
                            return false;
                        };
                        dragging = target;
                        if (isSetCapture) {
                            dragging.setCapture();
                        }
                        if (isLosecapture) {
                            dom.addEventListener(dragging, 'losecapture', dragend);
                        } else {
                            dom.addEventListener(window, 'blur', dragend);
                        }
                        dragdrop.trigger({
                            type: 'dragstart',
                            target: dragging,
                            x: event.pageX,
                            y: event.pageY
                        });
                    }
                },
                'mousemove': function (event) {
                    if (dragging !== null) {
                        event.preventDefault();
                        event.stopPropagation();
                        dragdrop.trigger({
                            type: 'drag',
                            target: dragging,
                            x: event.pageX,
                            y: event.pageY
                        });
                    }
                },
                'mouseup': function (event) {
                    dragend(event);
                }
            };
            _handlerFunc[event.type](event);
        }
        dom.addEventListener(document, 'mousedown', handlerEvent);
        dom.addEventListener(document, 'mousemove', handlerEvent);
        dom.addEventListener(document, 'mouseup', handlerEvent);
        return dragdrop;
    }
    jingoal.createDrag = CreateDrag;
}());
