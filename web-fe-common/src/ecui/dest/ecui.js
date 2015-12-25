var ecui;
(function () {



    var undefined,
        isStrict = document.compatMode === 'CSS1Compat',
        isWebkit = /webkit/i.test(navigator.userAgent),
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        operaVersion = /opera\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;

    /**
     * ECUI 的 DOM 包装器，用于链式调用。
     * @private
     *
     * @param {HTMLElement|Array<HTMLElement>} DOM 对象或 DOM 对象的数组
     */
    function DomWrap(element) {
        if (element instanceof Array) {
            this.elements = element;
        } else {
            this.elements = [element];
        }
    }

    /**
     * 构建 DOM 包装器的链式调用方法。
     * @private
     *
     * @param {string} DOM 操作的方法名
     */
    function __ECUI__buildWrapMethod(name) {
        DomWrap.prototype[name] = function () {
            var args = [null].concat(Array.prototype.slice.call(arguments, 0));
            this.elements.forEach(function (item) {
                args[0] = item;
                dom[name].apply(null, args);
            });
            return this;
        };
    }

    /**
     * 根据指定的选择符选择符合条件的元素。
     * @public
     *
     * @param {string} selector 选择符
     * @return {DomWray} ECUI 的 DOM 包装器，用于链式调用
     */
    ecui = function (selector) {
        return new DomWrap(document.getElementById(selector));
    };

    /**
     * 返回指定id的 DOM 对象。
     * @public
     *
     * @param {string} id DOM 对象标识
     * @return {HTMLElement} DOM 对象
     */
    ecui.$ = function (id) {
        return document.getElementById(id);
    };

    var core = ecui,
        dom = core.dom = {
            /**
             * 为 Element 对象添加新的样式。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名，可以是多个，中间使用空白符分隔
             */
            addClass: function (el, className) {
                // 这里直接添加是为了提高效率，因此对于可能重复添加的属性，请使用标志位判断是否已经存在，
                // 或者先使用 removeClass 方法删除之前的样式
                el.className += ' ' + className;
            },

            /**
             * 挂载事件。
             * @public
             *
             * @param {Object} obj 响应事件的对象
             * @param {string} type 事件类型
             * @param {Function} func 事件处理函数
             */
            addEventListener: ieVersion < 9 ? function (obj, type, func) {
                obj.attachEvent('on' + type, func);
            } : function (obj, type, func) {
                obj.addEventListener(type, func, true);
            },

            /**
             * 将指定的 Element 对象的内容移动到目标 Element 对象中。
             * @public
             *
             * @param {HTMLElement} el 指定的 Element 对象
             * @param {HTMLElement} target 目标 Element 对象
             * @param {boolean} all 是否移动所有的 DOM 对象，默认仅移动 ElementNode 类型的对象
             */
            childMoves: function (el, target, all) {
                for (el = el.firstChild; el; el = next) {
                    var next = el.nextSibling;
                    if (all || el.nodeType === 1) {
                        target.appendChild(el);
                    }
                }
            },

            /**
             * 获取所有 parentNode 为指定 Element 的子 Element 集合。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {Array} Element 对象数组
             */
            children: function (el) {
                var result = [];
                for (el = el.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        result.push(el);
                    }
                }
                return result;
            },

            /**
             * 判断一个 Element 对象是否包含另一个 Element 对象。
             * contain 方法认为两个相同的 Element 对象相互包含。
             * @public
             *
             * @param {HTMLElement} container 包含的 Element 对象
             * @param {HTMLElement} contained 被包含的 Element 对象
             * @return {boolean} contained 对象是否被包含于 container 对象的 DOM 节点上
             */
            contain: firefoxVersion ? function (container, contained) {
                return container === contained || !!(container.compareDocumentPosition(contained) & 16);
            } : function (container, contained) {
                return container.contains(contained);
            },

            /**
             * 创建 Element 对象。
             * @public
             *
             * @param {string} className 样式名称
             * @param {string} tagName 标签名称，默认创建一个空的 div 对象
             * @return {HTMLElement} 创建的 Element 对象
             */
            create: function (className, tagName) {
                tagName = document.createElement(tagName || 'DIV');
                if (className) {
                    tagName.className = className;
                }
                return tagName;
            },

            /**
             * 获取 Element 对象的第一个子 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 子 Element 对象
             */
            first: function (el) {
                for (el = el.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 获取 Element 对象的属性值。
             * 在 IE 下，Element 对象的属性可以通过名称直接访问，效率是 getAttribute 方式的两倍。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 属性名称
             * @return {string} 属性值
             */
            getAttribute: ieVersion < 8 ? function (el, name) {
                return el[name];
            } : function (el, name) {
                return el.getAttribute(name);
            },

            setAttribute: ieVersion < 8 ? function (el, name ,value) {
                el[name] = value;
            } : function (el, name, value) {
                el.setAttribute(name, value);
            }

            /**
             * 获取 Element 对象的父 Element 对象。
             * 在 IE 下，Element 对象被 removeChild 方法移除时，parentNode 仍然指向原来的父 Element 对象，与 W3C 标准兼容的属性应该是 parentElement。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 父 Element 对象，如果没有，返回 null
             */
            getParent: ieVersion ? function (el) {
                return el.parentElement;
            } : function (el) {
                return el.parentNode;
            },

            /**
             * 获取 Element 对象的页面位置。
             * getPosition 方法将返回指定 Element 对象的位置信息。属性如下：
             * left {number} X轴坐标
             * top  {number} Y轴坐标
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {Object} 位置信息
             */
            getPosition: function (el) {
                var top = 0,
                    left = 0,
                    body = document.body,
                    html = dom.getParent(body);

                if (ieVersion) {
                    if (!isStrict) {
                        // 在怪异模式下，IE 将 body 的边框也算在了偏移值中，需要先纠正
                        style = dom.getStyle(body);
                        if (isNaN(top = util.toNumber(style.borderTopWidth))) {
                            top = -2;
                        }
                        if (isNaN(left = util.toNumber(style.borderLeftWidth))) {
                            left = -2;
                        }
                    }

                    style = el.getBoundingClientRect();
                    top += html.scrollTop + body.scrollTop - html.clientTop + Math.floor(style.top);
                    left += html.scrollLeft + body.scrollLeft - html.clientLeft + Math.floor(style.left);
                } else if (el === body) {
                    top = html.scrollTop + body.scrollTop;
                    left = html.scrollLeft + body.scrollLeft;
                } else if (el !== html) {
                    for (var parent = el, childStyle = dom.getStyle(el); parent; parent = parent.offsetParent) {
                        top += parent.offsetTop;
                        left += parent.offsetLeft;
                        // safari里面，如果遍历到了一个fixed的元素，后面的offset都不准了
                        if (isWebkit > 0 && dom.getStyle(parent, 'position') === 'fixed') {
                            left += body.scrollLeft;
                            top  += body.scrollTop;
                            break;
                        }
                    }

                    if (operaVersion || (isWebkit && dom.getStyle(el, 'position') === 'absolute')) {
                        top -= body.offsetTop;
                    }

                    for (parent = dom.getParent(el); parent !== body; parent = dom.getParent(parent)) {
                        left -= parent.scrollLeft;
                        if (!operaVersion) {
                            var style = dom.getStyle(parent);
                            // 以下解决firefox下特殊的布局引发的双倍border边距偏移的问题，使用 html 作为临时变量
                            html = firefoxVersion && style.overflow !== 'visible' && childStyle.position === 'absolute' ? 2 : 1;
                            top += util.toNumber(style.borderTopWidth) * html - parent.scrollTop;
                            left += util.toNumber(style.borderLeftWidth) * html;
                            childStyle = style;
                        } else if (parent.tagName !== 'TR') {
                            top -= parent.scrollTop;
                        }
                    }
                }

                return {top: top, left: left};
            },

            /**
             * 获取 Element 对象的 CssStyle 对象或者是指定的样式值。
             * getStyle 方法如果不指定样式名称，将返回 Element 对象的当前 CssStyle 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 样式名称
             * @return {CssStyle|Object} CssStyle 对象或样式值
             */
            getStyle: function (el, name) {
                var fixer = __ECUI__styleFixer[name],
                    style = el.currentStyle || (ieVersion ? el.style : getComputedStyle(el, null));

                return name ? fixer && fixer.get ? fixer.get(el, style) : style[fixer || name] : style;
            },

            /**
             * 获取 Element 对象的文本。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {string} Element 对象的文本
             */
            getText: ieVersion < 9 ? function (el) {
                return el.innerText;
            } : function (el) {
                return el.textContent;
            },

            /**
             * 判断指定的样式是否包含在 Element 对象中。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名称
             * @return {boolean} true，样式包含在 Element 对象中
             */
            hasClass: function (el, className) {
                return el.className.split(/\s+/).indexOf(className) >= 0;
            },

            /**
             * 将 Element 对象插入指定的 Element 对象之后。
             * 如果指定的 Element 对象没有父 Element 对象，相当于 remove 操作。
             * @public
             *
             * @param {HTMLElement} el 被插入的 Element 对象
             * @param {HTMLElement} target 目标 Element 对象
             * @return {HTMLElement} 被插入的 Element 对象
             */
            insertAfter: function (el, target) {
                var parent = dom.getParent(target);
                return parent ? parent.insertBefore(el, target.nextSibling) : dom.remove(el);
            },

            /**
             * 将 Element 对象插入指定的 Element 对象之前。
             * 如果指定的 Element 对象没有父 Element 对象，相当于 remove 操作。
             * @public
             *
             * @param {HTMLElement} el 被插入的 Element 对象
             * @param {HTMLElement} target 目标 Element 对象
             * @return {HTMLElement} 被插入的 Element 对象
             */
            insertBefore: function (el, target) {
                var parent = dom.getParent(target);
                return parent ? parent.insertBefore(el, target) : dom.remove(el);
            },

            /**
             * 向指定的 Element 对象内插入一段 html 代码。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} position 插入 html 的位置信息，取值为 beforeBegin,afterBegin,beforeEnd,afterEnd
             * @param {string} html 要插入的 html 代码
             */
            insertHTML: firefoxVersion ? function (el, position, html) {
                var name = {
                        AFTERBEGIN: 'selectNodeContents',
                        BEFOREEND: 'selectNodeContents',
                        BEFOREBEGIN: 'setStartBefore',
                        AFTEREND: 'setEndAfter'
                    }[position.toUpperCase()],
                    range = document.createRange();

                range[name](el);
                range.collapse(position.length > 9);
                range.insertNode(range.createContextualFragment(html));
            } : function (el, position, html) {
                el.insertAdjacentHTML(position, html);
            },

            /**
             * 获取 Element 对象的最后一个子 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 子 Element 对象
             */
            last: function (el) {
                for (el = el.lastChild; el; el = el.previousSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 获取Element 对象的下一个兄弟节点。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 下一个兄弟 Element 对象
             */
            next: function (el) {
                for (el = el.nextSibling; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 获取Element 对象的上一个兄弟节点。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 上一个兄弟 Element 对象
             */
            previous: function (el) {
                for (el = el.previousSibling; el; el = el.previousSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 从页面中移除 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 被移除的 Element 对象
             */
            remove: function (el) {
                var parent = dom.getParent(el);
                if (parent) {
                    parent.removeChild(el);
                }
                return el;
            },

            /**
             * 删除 Element 对象中的样式。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名，可以是多个，中间用空白符分隔
             */
            removeClass: function (el, className) {
                // 容错，后面查具体原因
                if (el === null) {
                    return;
                }
                var oldClasses = el.className.split(/\s+/).sort(),
                    newClasses = className.split(/\s+/).sort(),
                    i = oldClasses.length,
                    j = newClasses.length;

                for (; i && j; ) {
                    if (oldClasses[i - 1] === newClasses[j - 1]) {
                        oldClasses.splice(--i, 1);
                    } else if (oldClasses[i - 1] < newClasses[j - 1]) {
                        j--;
                    } else {
                        i--;
                    }
                }
                el.className = oldClasses.join(' ');
            },

            /**
             * 卸载事件。
             * @public
             *
             * @param {Object} obj 响应事件的对象
             * @param {string} type 事件类型
             * @param {Function} func 事件处理函数
             */
            removeEventListener: ieVersion < 9 ? function (obj, type, func) {
                obj.detachEvent('on' + type, func);
            } : function (obj, type, func) {
                obj.removeEventListener(type, func, true);
            },

            /**
             * 设置输入框的表单项属性。
             * 如果没有指定一个表单项，setInput 方法将创建一个表单项。
             * @public
             *
             * @param {HTMLElement} el InputElement 对象
             * @param {string} name 新的表单项名称，默认与 el 相同
             * @param {string} type 新的表单项类型，默认为 el 相同
             * @return {HTMLElement} 设置后的 InputElement 对象
             */
            setInput: function (el, name, type) {
                if (!el) {
                    if (type === 'textarea') {
                        el = dom.create('', 'TEXTAREA');
                    } else {
                        if (ieVersion < 9) {
                            return dom.create('', '<input type="' + (type || '') + '" name="' + (name || '') + '">');
                        }
                        el = dom.create('', 'INPUT');
                    }
                }

                name = name === undefined ? el.name : name;
                type = type === undefined ? el.type : type;

                if (el.name !== name || el.type !== type) {
                    if ((ieVersion && type !== 'textarea') || (el.type !== type && (el.type === 'textarea' || type === 'textarea'))) {
                        dom.insertHTML(el, 'AFTEREND', '<' + (type === 'textarea' ? 'textarea' : 'input type="' + type + '"') + ' name="' + name + '" class="' + el.className + '" style="' + el.style.cssText + '" ' + (el.disabled ? 'disabled' : '') + (el.readOnly ? ' readOnly' : '') + '>');
                        name = el;
                        (el = el.nextSibling).value = name.value;
                        if (type === 'radio') {
                            el.checked = name.checked;
                        }
                        dom.remove(name);
                    } else {
                        el.type = type;
                        el.name = name;
                    }
                }
                return el;
            },

            /**
             * 设置 Element 对象的样式值。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 样式名称
             * @param {string} value 样式值
             */
            setStyle: function (el, name, value) {
                var fixer = __ECUI__styleFixer[name];
                if (fixer && fixer.set) {
                    fixer.set(el, value);
                } else {
                    el.style[fixer || name] = value;
                }
            }
        },
        ext = core.ext = {},
        io = core.io = {
            /**
             * 发送一个ajax请求。
             * options 对象支持的属性如下：
             * method    {string}   请求类型，默认为GET
             * async     {boolean}  是否异步请求，默认为true(异步)
             * data      {string}   需要发送的数据，主要用于POST
             * headers   {Object}   要设置的http request header
             * timeout   {number}   超时时间
             * nocache   {boolean}  是否需要缓存，默认为false(缓存)
             * onsuccess {Function} 请求成功时触发
             * onerror   {Function} 请求发生错误时触发
             * @public
             *
             * @param {string} url 发送请求的url
             * @param {Object} options 选项
             */
            ajax: function (url, options) {
                options = options || {};

                var data = options.data || '',
                    async = options.async !== false,
                    method = (options.method || 'GET').toUpperCase(),
                    headers = options.headers || {},
                    onerror = options.onerror || util.blank,
                    // 基本的逻辑来自lili同学提供的patch
                    stop,
                    key,
                    xhr;

                try {
                    if (window.ActiveXObject) {
                        try {
                            xhr = new ActiveXObject('Msxml2.XMLHTTP');
                        } catch (e) {
                            xhr = new ActiveXObject('Microsoft.XMLHTTP');
                        }
                    } else {
                        xhr = new XMLHttpRequest();
                    }

                    if (method === 'GET') {
                        if (data) {
                            url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
                            data = null;
                        }
                        if (!options.cache) {
                            url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + Date.now() + '=1';
                        }
                    }

                    xhr.open(method, url, async);

                    if (async) {
                        xhr.onreadystatechange = stateChangeHandler;
                    }

                    // 在open之后再进行http请求头设定
                    // FIXME 是否需要添加; charset=UTF-8呢
                    if (method === 'POST') {
                        xhr.setRequestHeader('Content-Type', headers['Content-Type'] || 'application/x-www-form-urlencoded');
                        delete headers['Content-Type'];
                    }

                    for (key in headers) {
                        if (headers.hasOwnProperty(key)) {
                            xhr.setRequestHeader(key, headers[key]);
                        }
                    }

                    if (options.timeout) {
                        stop = util.timer(function () {
                            xhr.onreadystatechange = util.blank;
                            xhr.abort();
                            onerror();
                        }, options.timeout);
                    }
                    xhr.send(data);

                    if (!async) {
                        stateChangeHandler();
                    }
                } catch (e) {
                    onerror();
                }

                function stateChangeHandler() {
                    if (xhr.readyState === 4) {
                        try {
                            var status = xhr.status;
                        } catch (ignore) {
                            // 在请求时，如果网络中断，Firefox会无法取得status
                        }

                        // IE error sometimes returns 1223 when it
                        // should be 204, so treat it as success
                        if ((status >= 200 && status < 300) || status === 304 || status === 1223) {
                            if (options.onsuccess) {
                                options.onsuccess(xhr.responseText, xhr);
                            }
                        } else {
                            onerror();
                        }

                        /*
                         * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
                         * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
                         * function maybe still be called after it is deleted. The theory is that the
                         * callback is cached somewhere. Setting it to null or an empty function does
                         * seem to work properly, though.
                         *
                         * On IE, there are two problems: Setting onreadystatechange to null (as
                         * opposed to an empty function) sometimes throws an exception. With
                         * particular (rare) versions of jscript.dll, setting onreadystatechange from
                         * within onreadystatechange causes a crash. Setting it from within a timeout
                         * fixes this bug (see issue 1610).
                         *
                         * End result: *always* set onreadystatechange to an empty function (never to
                         * null). Never set onreadystatechange from within onreadystatechange (always
                         * in a setTimeout()).
                         */
                        util.timer(function () {
                            xhr.onreadystatechange = util.blank;
                            if (async) {
                                xhr = null;
                            }
                        }, 0);

                        if (stop) {
                            stop();
                        }
                    }
                }
            },

            /**
             * 通过script标签加载数据。
             * options 对象支持的属性如下：
             * charset {string}   字符集
             * timeout {number}   超时时间
             * onerror {Function} 超时或无法加载文件时触发本函数
             * @public
             *
             * @param {string} url 加载数据的url
             * @param {Function} callback 数据加载结束时调用的函数或函数名
             * @param {Object} options 选项
             */
            loadScript: function (url, callback, options) {
                function removeScriptTag() {
                    scr.onload = scr.onreadystatechange = scr.onerror = null;
                    if (scr && scr.parentNode) {
                        scr.parentNode.removeChild(scr);
                    }
                    scr = null;
                }

                options = options || {};

                if (!options.cache) {
                    url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + Date.now() + '=1';
                }

                var scr = document.createElement('SCRIPT'),
                    scriptLoaded = 0,
                    stop;

                // IE和opera支持onreadystatechange
                // safari、chrome、opera支持onload
                scr.onload = scr.onreadystatechange = function () {
                    // 避免opera下的多次调用
                    if (scriptLoaded) {
                        return;
                    }

                    if (scr.readyState === undefined || scr.readyState === 'loaded' || scr.readyState === 'complete') {
                        scriptLoaded = 1;
                        try {
                            if (callback) {
                                callback();
                            }
                            if (stop) {
                                stop();
                            }
                        } finally {
                            removeScriptTag();
                        }
                    }
                };

                if (options.timeout) {
                    stop = util.timer(function () {
                        removeScriptTag();
                        if (options.onerror) {
                            options.onerror();
                        }
                    }, options.timeout);
                }

                if (options.charset) {
                    scr.setAttribute('charset', options.charset);
                }
                scr.setAttribute('src', url);
                scr.onerror = options.onerror;
                document.head.appendChild(scr);
            }
        },
        ui = core.ui = {},
        util = core.util = {
            /*
             * 空函数。
             * blank 方法不应该被执行，也不进行任何处理，它用于提供给不需要执行操作的事件方法进行赋值，与 blank 类似的用于给事件方法进行赋值，而不直接被执行的方法还有 cancel。
             * @public
             */
            blank: new Function(),

            /**
             * 对目标字符串进行 html 编码。
             * encodeHTML 方法对四个字符进行编码，分别是 &<>"
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            encodeHTML: function (source) {
                return source.replace(
                    /[&<>"']/g,
                    function (c) {
                        return '&#' + c.charCodeAt(0) + ';';
                    }
                );
            },

            /**
             * 对目标字符串进行 html 解码。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            decodeHTML : (function () {
                var codeTable = {
                    quot: '"',
                    lt: '<',
                    gt: '>',
                    amp: '&'
                };

                return function (source) {
                    //处理转义的中文和实体字符
                    return source.replace(/&(quot|lt|gt|amp|#([\d]+));/g, function (match, $1, $2) {
                        return codeTable[$1] || String.fromCharCode(+$2);
                    });
                };
            }()),

            /**
             * 对象属性复制。
             * @public
             *
             * @param {Object} target 目标对象
             * @param {Object} source 源对象
             * @return {Object} 目标对象
             */
            extend: function (target, source) {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
                return target;
            },

            /**
             * 获取浏览器可视区域的相关信息。
             * getView 方法将返回浏览器可视区域的信息。属性如下：
             * top        {number} 可视区域最小X轴坐标
             * right      {number} 可视区域最大Y轴坐标
             * bottom     {number} 可视区域最大X轴坐标
             * left       {number} 可视区域最小Y轴坐标
             * width      {number} 可视区域的宽度
             * height     {number} 可视区域的高度
             * pageWidth  {number} 页面的宽度
             * pageHeight {number} 页面的高度
             * @public
             *
             * @return {Object} 浏览器可视区域信息
             */
            getView: function () {
                var body = document.body,
                    html = dom.getParent(body),
                    client = isStrict ? html : body,
                    scrollTop = html.scrollTop + body.scrollTop,
                    scrollLeft = html.scrollLeft + body.scrollLeft,
                    clientWidth = client.clientWidth,
                    clientHeight = client.clientHeight;

                return {
                    top: scrollTop,
                    right: scrollLeft + clientWidth,
                    bottom: scrollTop + clientHeight,
                    left: scrollLeft,
                    width: clientWidth,
                    height: clientHeight,
                    pageWidth: Math.max(html.scrollWidth, body.scrollWidth, clientWidth),
                    pageHeight: Math.max(html.scrollHeight, body.scrollHeight, clientHeight)
                };
            },

            /**
             * 渐变处理。
             * @public
             *
             * @param {Function|string} fn 处理渐变的函数或函数体
             * @param {number} duration 渐变的总时长
             * @param {Object} options 渐变的参数，一般用于描述渐变的信息
             * @param {Function} transition 时间线函数
             * @return {Function} 停止渐变或直接执行渐变到最后
             */
            grade: function (fn, duration, options, transition) {
                if ('string' === typeof fn) {
                    var result = [];
                    fn.split(';').forEach(function (item) {
                        var list = item.split('->'),
                            values = new Function('$', 'return [' + list.join(',') + ']').call(options.$, options);
                        if (/-?[0-9]+(\.[0-9]+)?/.test(values[0])) {
                            var currValue = RegExp['$&'];
                            if (currValue !== values[1]) {
                                result.push(list[0] + '=' + (RegExp.leftContext ? '"' + RegExp.leftContext.replace('"', '\\"') + '"+' : '') + '(' + currValue + '+(' + list[1] + '-(' + currValue + '))*p)' + (RegExp.rightContext ? '+"' + RegExp.rightContext.replace('"', '\\"') + '"' : ''));
                            }
                        }
                    });
                    if (!result.length) {
                        return;
                    }
                    fn = new Function('p', '$', result.join(';'));
                }

                var startTime = Date.now(),
                    stop = util.timer(function () {
                        var currTime = Date.now() - startTime,
                            percent = transition(currTime / duration);
                        if (currTime >= duration) {
                            percent = 1;
                            stop();
                        }
                        fn.call(options.$, percent, options);
                        if (percent === 1) {
                            fn = options = transition = null;
                        }
                    }, -20);

                transition = transition || function (percent) {
                    return 1 - Math.pow(1 - percent, 2);
                };

                return function (flag) {
                    if (fn) {
                        stop();
                        if (flag) {
                            fn.call(options.$, 1, options);
                        }
                    }
                    fn = options = transition = null;
                };
            },

            /**
             * 类继承。
             * @public
             *
             * @param {Function} subClass 子类
             * @param {Function} superClass 父类
             * @return {Object} subClass 的 prototype 属性
             */
            inherits: function (subClass, superClass) {
                var oldPrototype = subClass.prototype,
                    Clazz = new Function();

                Clazz.prototype = superClass.prototype;
                util.extend(subClass.prototype = new Clazz(), oldPrototype);
                subClass.prototype.constructor = subClass;
                subClass.superClass = superClass.prototype;

                return subClass.prototype;
            },

            /**
             * 从数组中移除对象。
             * @public
             *
             * @param {Array} array 数组对象
             * @param {Object} obj 需要移除的对象
             */
            remove: function (array, obj) {
                for (var i = array.length; i--; ) {
                    if (array[i] === obj) {
                        array.splice(i, 1);
                    }
                }
            },

            /**
             * 设置缺省的属性值。
             * 如果对象的属性已经被设置，setDefault 方法不进行任何处理，否则将默认值设置到指定的属性上。
             * @public
             *
             * @param {Object} obj 被设置的对象
             * @param {string} key 属性名
             * @param {Object} value 属性的默认值
             */
            setDefault: function (obj, key, value) {
                if (!obj.hasOwnProperty(key)) {
                    obj[key] = value;
                }
            },

            /**
             * 字符串格式化
             *
             * @inner
             * @param {string} source 目标模版字符串
             * @param {string} ... 字符串替换项集合
             * @return {string} 格式化结果
             */
            stringFormat: function (source) {
                var args = arguments;
                return source.replace(
                    /\{([0-9]+)\}/g,
                    function (match, index) {
                        return args[+index + 1];
                    }
                );
            },

            /**
             * 创建一个定时器对象。
             * @public
             *
             * @param {Function} func 定时器需要调用的函数
             * @param {number} delay 定时器延迟调用的毫秒数，如果为负数表示需要连续触发
             * @param {Object} caller 调用者，在 func 被执行时，this 指针指向的对象，可以为空
             * @param {Object} ... 向 func 传递的参数
             * @return {Function} 用于关闭定时器的方法
             */
            timer: function (func, delay, caller) {
                function build() {
                    return (delay < 0 ? setInterval : setTimeout)(
                        function () {
                            func.apply(caller, args);
                            // 使用delay<0而不是delay>=0，是防止delay没有值的时候，不进入分支
                            if (!delay || delay > 0) {
                                func = caller = args = null;
                            }
                        },
                        Math.abs(delay)
                    );
                }

                var args = Array.prototype.slice.call(arguments, 3),
                    handle = build(),
                    pausing;

                /**
                 * 中止定时调用。
                 * @public
                 *
                 * @param {boolean} pause 是否暂时停止定时器，如果参数是 true，再次调用函数并传入参数 true 恢复运行。
                 */
                return function (pause) {
                    (delay < 0 ? clearInterval : clearTimeout)(handle);
                    if (pause) {
                        if (pausing) {
                            handle = build();
                        }
                        pausing = !pausing;
                    } else {
                        func = caller = args = null;
                    }
                };
            },

            /**
             * 驼峰命名法转换。
             * toCamelCase 方法将 xxx-xxx 字符串转换成 xxxXxx。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            toCamelCase: function (source) {
                if (source.indexOf('-') < 0) {
                    return source;
                }
                return source.replace(
                    /\-./g,
                    function (match) {
                        return match.charAt(1).toUpperCase();
                    }
                );
            },

            /**
             * 将对象转换成数值。
             * toNumber 方法会省略数值的符号，例如字符串 9px 将当成数值的 9，不能识别的数值将默认为 0。
             * @public
             *
             * @param {Object} obj 需要转换的对象
             * @return {number} 对象的数值
             */
            toNumber: function (obj) {
                return parseInt(obj, 10) || 0;
            }
        };

    var eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate', 'keydown', 'keypress', 'keyup', 'mousewheel'];

    // 读写特殊的 css 属性操作
    var __ECUI__styleFixer = {
            display:
                ieVersion < 8 ? {
                    get: function (el, style) {
                        return style.display === 'inline' && style.zoom === '1' ? 'inline-block' : style.display;
                    },

                    set: function (el, value) {
                        if (value === 'inline-block') {
                            value = 'inline';
                            el.style.zoom = 1;
                        }
                        el.style.display = value;
                    }
                } : undefined,

            opacity:
                ieVersion < 9 ? {
                    get: function (el, style) {
                        if (/\(opacity=(\d+)/.test(style.filter)) {
                            return String(+RegExp.$1 / 100);
                        }
                        return '1';
                    },

                    set: function (el, value) {
                        el.style.filter = el.style.filter.replace(/alpha\([^\)]*\)/gi, '') + (ieVersion < 8 ? 'alpha' : 'progid:DXImageTransform.Microsoft.Alpha') + '(opacity=' + value * 100 + ')';
                    }
                } : undefined,

            'float': ieVersion ? 'styleFloat' : 'cssFloat'
        };

    /**
     * 设置页面加载完毕后自动执行的方法。
     * @public
     *
     * @param {Function} func 需要自动执行的方法
     */
    dom.ready = (function () {
        var hasReady = false,
            list = [],
            check;

        function ready() {
            if (!hasReady) {
                hasReady = true;
                list.forEach(function (item) {
                    item();
                });
            }
        }

        if (document.addEventListener && !operaVersion) {
            document.addEventListener('DOMContentLoaded', ready, false);
        } else if (ieVersion && window === top) {
            check = function () {
                try {
                    document.documentElement.doScroll('left');
                    ready();
                } catch (e) {
                    util.timer(check, 0);
                }
            };
            check();
        }

        dom.addEventListener(window, 'load', ready);

        return function (func) {
            if (hasReady) {
                func();
            } else {
                list.push(func);
            }
        };
    }());

    if (ieVersion < 9) {
        document.head = document.getElementsByTagName('HEAD')[0];
    }

    try {
        document.execCommand('BackgroundImageCache', false, true);
    } catch (ignore) {
    }

    for (var key in dom) {
        if (dom.hasOwnProperty(key)) {
            __ECUI__buildWrapMethod(key);
        }
    }


(function () {

    var isMobile = /(Android|iPhone)/i.test(navigator.userAgent),
        ecuiName = 'ui',          // Element 中用于自动渲染的 ecui 属性名称
        isGlobalId,               // 是否自动将 ecui 的标识符全局化

        flgFixedOffset,           // 在计算相对位置时，是否需要修正边框样式的影响
        scrollNarrow,             // 浏览器滚动条相对窄的一边的长度

        initRecursion = 0,        // init 操作的递归次数
        lastClientWidth,          // 浏览器之前的宽度

        maskElements = [],        // 遮罩层组
        unmasks = [],             // 用于取消庶罩层的函数列表

        touchCount = 0,           // 触屏的次数(可能多指)
        pauseCount = 0,           // 暂停的次数
        mouseX,                   // 当前鼠标光标的X轴坐标
        mouseY,                   // 当前鼠标光标的Y轴坐标
        keyCode = 0,              // 当前键盘按下的键值，解决keypress与keyup中得不到特殊按键的keyCode的问题
        lastClick,                // 上一次产生点击事件的信息

        allControls = [],         // 全部生成的控件，供释放控件占用的内存使用
        independentControls = [], // 独立的控件，即使用create($create)方法创建的控件
        namedControls,            // 所有被命名的控件的集合
        uniqueIndex = 0,          // 控件的唯一序号
        delegateControls = {},    // 等待关联的控件集合

        activedControl,           // 当前环境下被激活的控件，即鼠标左键按下时对应的控件，直到左键松开后失去激活状态
        hoveredControl = null,    // 当前环境下鼠标悬停的控件
        focusedControl = null,    // 当前环境下拥有焦点的控件

        eventListeners = {},      // 控件事件监听描述对象
        eventStack = {},          // 事件调用堆栈记录，防止事件重入

        envStack = [],            // 高优先级事件调用时，保存上一个事件环境的栈
        currEnv = {               // 当前操作的环境

            // 触屏事件到鼠标事件的转化
            touchstart: function (event) {
                if (!ieVersion) {
                    event = core.wrapEvent(event);
                    currEnv.mousedown(event);
                }
            },

            touchmove: function (event) {
                if (!ieVersion) {
                    event = core.wrapEvent(event);
                    currEnv.mousemove(event);
                }
            },

            touchend: function (event) {
                if (!ieVersion) {
                    event = core.wrapEvent(event);
                    currEnv.mouseup(event);
                    // 解决非ie浏览器下触屏事件是touchstart/touchend/mouseover的问题，屏弊mouse事件
                    // TODO: 需要判断target与touchstart的target是否为同一个
                    for (var el = event.target; el; el = dom.getParent(el)) {
                        if (el.tagName === 'A') {
                            el.click();
                            break;
                        }
                    }
                    event.exit();
                }
            },

            touchcancel: function (event) {
                currEnv.touchend(event);
            },

            selectstart: function (event) {
                // IE下取消对文字的选择不能仅通过阻止 mousedown 事件的默认行为实现
                event = core.wrapEvent(event);
                onselectstart(core.findControl(event.target), event);
            },

            /**
             * 键盘事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            keydown: function (event) {
                event = core.wrapEvent(event);
                keyCode = event.which;
                bubble(focusedControl, 'keydown', event);
            },

            /**
             * 键盘事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            keypress: function (event) {
                event = core.wrapEvent(event);
                bubble(focusedControl, 'keypress', event);
            },

            /**
             * 键盘事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            keyup: function (event) {
                event = core.wrapEvent(event);
                bubble(focusedControl, 'keyup', event);
                if (keyCode === event.which) {
                    // 一次多个键被按下，只有最后一个被按下的键松开时取消键值码
                    keyCode = 0;
                }
            },

            /**
             * 滚轮事件处理(firefox)。
             * @private
             *
             * @param {Event} event 事件对象
             */
            DOMMouseScroll: function (event) {
                onmousewheel(event, event.detail);
            },

            /**
             * 滚轮事件处理(other)。
             * @private
             *
             * @param {Event} event 事件对象
             */
            mousewheel: function (event) {
                onmousewheel(event, event.wheelDelta / -40);
            },

            /**
             * 双击事件与选中内容开始事件处理。
             * @private
             *
             * @param {Event} event 事件对象
             */
            dblclick: function (event) {
                if (ieVersion) {
                // IE下双击事件不依次产生 mousedown 与 mouseup 事件，需要模拟
                    currEnv.mousedown(event);
                    currEnv.mouseup(event);
                }
            },

            // 鼠标点击时控件如果被屏弊需要取消点击事件的默认处理，此时链接将不能提交
            click: function (event) {
                event = core.wrapEvent(event);

                var control = core.findControl(event.target);

                if (control && control.isDisabled()) {
                    // 取消点击的默认行为，只要外层的Control被屏蔽，内部的链接(A)与输入框(INPUT)全部不能再得到焦点
                    // INPUT情况特殊，此时使用Tab键仍然是可以进入的，需要屏蔽tab键进入，请手工将对应的输入框设置tabIndex=-1
                    // 系统不自动设置tabIndex是考虑到input有可能removeChild或appendChild，无法考虑到所有的情况
                    // 此时点击回退键，会导致页面后退
                    event.preventDefault();
                }
            },

            dragend: function (event) {
                currEnv.mouseup(event);
            },

            // 鼠标左键按下需要改变框架中拥有焦点的控件
            mousedown: function (event) {
                if (isMobile && event.type === 'mousedown') {
                    return;
                }
                event = core.wrapEvent(event);

                if (event.which === 1) {
                    if (activedControl) {
                        // 如果按下鼠标左键后，使用ALT+TAB使浏览器失去焦点然后松开鼠标左键，
                        // 需要恢复激活控件状态，第一次点击失效
                        bubble(activedControl, 'deactivate');
                        activedControl = undefined;
                        // 这里不能return，要考虑请求来自于其它环境的情况
                    }

                    var control = event.getControl(),
                        // 修复ie下跨iframe导致的事件类型错误的问题
                        flag = ieVersion < 9 && isScrollClick(event),
                        target = control;

                    if (!(lastClick && isDblClick())) {
                        lastClick = {time: Date.now()};
                    }

                    if (control) {
                        if (flag) {
                            // IE8以下的版本，如果为控件添加激活样式，原生滚动条的操作会失效
                            // 常见的表现是需要点击两次才能进行滚动操作，而且中途不能离开控件区域
                            // 以免触发悬停状态的样式改变。
                            return;
                        }

                        if (!(ieVersion < 9 && (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT'))) {
                            setCapture();
//                            event.target.focus();
                        }

                        for (; target; target = target.getParent()) {
                            if (target.isFocusable()) {
                                if (!(target !== control && target.contain(focusedControl))) {
                                    // 允许获得焦点的控件必须是当前激活的控件，或者它没有焦点的时候才允许获得
                                    // 典型的用例是滚动条，滚动条不需要获得焦点，如果滚动条的父控件没有焦点
                                    // 父控件获得焦点，否则焦点不发生变化
                                    core.setFocused(target);
                                }
                                break;
                            }
                        }

                        if (!flag) {
                            // 如果不是在原生滚动条区域，进行左键按下的处理
                            mousedown(control, event);
                        }
                    } else {
                        if (control = core.findControl(target = event.target)) {
                            // 如果点击的是失效状态的控件，检查是否需要取消文本选择
                            onselectstart(control, event);
                            // 检查是否INPUT/SELECT/TEXTAREA/BUTTON标签，需要失去焦点，
                            // 因为ecui不能阻止mousedown focus输入框
                            if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
                                util.timer(
                                    function () {
                                        target.blur();
                                    }
                                );
                            }
                        }
                        // 点击到了空白区域，取消控件的焦点
                        core.setFocused();
                        // 正常情况下 activedControl 是 undefined，如果是down按下但未点击到控件，此值为null
                        activedControl = null;
                    }
                }
            },

            mousemove: function (event) {
                event = core.wrapEvent(event);

                var control = event.getControl();
                bubble(control, 'mousemove', event);
            },

            // 鼠标移入的处理，需要计算是不是位于当前移入的控件之外，如果是需要触发移出事件
            mouseover: function (event) {
                event = core.wrapEvent(event);

                var control = event.getControl(),
                    parent = getCommonParent(control, hoveredControl);

                bubble(hoveredControl, 'mouseout', event, parent);
                hoveredControl = control;
                bubble(control, 'mouseover', event, parent);
            },

            mouseup: function (event) {
                if (isMobile && event.type === 'mouseup') {
                    return;
                }
                releaseCapture();

                event = core.wrapEvent(event);

                var control = event.getControl(),
                    commonParent;

                if (activedControl !== undefined) {
                    // 如果为 null 表示之前没有触发 mousedown 事件就触发了 mouseup，
                    // 这种情况出现在鼠标在浏览器外按下了 down 然后回浏览器区域 up，
                    // 或者是 ie 系列浏览器在触发 dblclick 之前会触发一次单独的 mouseup，
                    // dblclick 在 ie 下的事件触发顺序是 mousedown/mouseup/click/mouseup/dblclick
                    bubble(control, 'mouseup', event);

                    if (activedControl) {
                        commonParent = getCommonParent(control, activedControl);
                        bubble(commonParent, 'click', event);
                        // 点击事件在同时响应鼠标按下与弹起周期的控件上触发(如果之间未产生鼠标移动事件)
                        // 模拟点击事件是为了解决控件的 Element 进行了 remove/append 操作后 click 事件不触发的问题
                        if (lastClick) {
                            if (isDblClick() && lastClick.target === control) {
                                bubble(commonParent, 'dblclick', event);
                                lastClick = null;
                            } else {
                                lastClick.target = control;
                            }
                        }
                        bubble(activedControl, 'deactivate', event);
                    }

                    // 将 activeControl 的设置复位，此时表示没有鼠标左键点击
                    activedControl = undefined;
                }
            }
        },

        dragEnv = { // 拖曳操作的环境
            type: 'drag',

            mousemove: function (event) {
                event = core.wrapEvent(event);

                var target = currEnv.target,
                    // 计算期待移到的位置
                    expectX = target.getX() + mouseX - currEnv.x,
                    expectY = target.getY() + mouseY - currEnv.y,
                    // 计算实际允许移到的位置
                    x = Math.min(Math.max(expectX, currEnv.left), currEnv.right),
                    y = Math.min(Math.max(expectY, currEnv.top), currEnv.bottom),
                    control = null;

                if (core.triggerEvent(target, 'dragmove', event, x, y)) {
                    target.setPosition(x, y);
                }

                currEnv.x = mouseX + target.getX() - expectX;
                currEnv.y = mouseY + target.getY() - expectY;

                // 增加对drag时控件mouseover行为的处理
                x = event.pageX;
                y = event.pageY;

                allControls.forEach(function (item) {
                    if (item.$allowDragListen()) {
                        var pos = core.dom.getPosition(item.getOuter());
                        if (pos.top <= y && pos.top + item.getHeight() >= y && pos.left <= x && pos.left + item.getWidth() >= x) {
                            control = item;
                            bubble(control, 'mousemove', event);
                        }
                    }
                });

                target = getCommonParent(control, hoveredControl);
                bubble(hoveredControl, 'mouseout', event, target);
                hoveredControl = control;
                bubble(control, 'mouseover', event, target);
            },

            mouseover: util.blank,

            mouseup: function (event) {
                releaseCapture();

                event = core.wrapEvent(event);

                var target = currEnv.target;
                core.triggerEvent(target, 'dragend', event);
                activedControl = currEnv.actived;
                core.restore();

                currEnv.mouseover(event);
                currEnv.mouseup(event);
            }
        },

        interceptEnv = { // 强制点击拦截操作的环境，下拉框，弹出菜单等需要拦截第一次的点击调用
            type: 'intercept',

            mousedown: function (event) {
                event = core.wrapEvent(event);

                if (event.which === 1) {
                    var target = currEnv.target;

                    // 如果需要在intercept中触发click事件，需要设置activedControl的值
                    activedControl = event.getControl();

                    lastClick = null;

                    if (!isScrollClick(event)) {
                        setCapture();
                        if (activedControl && !activedControl.isFocusable()) {
                            // 需要捕获但不激活的控件是最高优先级处理的控件，例如滚动条
                            mousedown(activedControl, event);
                        } else {
                            // 默认仅拦截一次，框架自动释放环境
                            if (core.triggerEvent(target, 'intercept', event)) {
                                core.restore();
                            }
                            // 取消冒泡，则控件不会触发click
                            if (event.cancelBubble) {
                                activedControl = undefined;
                            }
                        }
                    }
                }
            }
        };

    /**
     * 创建 ECUI 事件对象。
     * @public
     *
     * @param {string} type 事件类型
     * @param {Event} event 浏览器原生事件对象，忽略将自动填充
     */
    function ECUIEvent(type, event) {
        this.type = type;
        if (event) {
            if (event.touches) {
                if (event.touches[0]) {
                    this.pageX = event.touches[0].pageX;
                    this.pageY = event.touches[0].pageY;
                } else {
                    this.pageX = mouseX;
                    this.pageY = mouseY;
                }
                this.which = 1;
            } else {
                this.pageX = event.pageX;
                this.pageY = event.pageY;
                this.which = event.which;
            }
            this.target = event.target;
            this._oNative = event;
        } else {
            this.pageX = mouseX;
            this.pageY = mouseY;
            this.which = keyCode;
            this.target = document;
        }
    }

    util.extend(ECUIEvent.prototype, {
        /**
         * 获取触发事件的 ECUI 控件 对象
         * @public
         *
         * @return {ecui.ui.Control} 控件对象
         */
        getControl: function () {
            var o = core.findControl(this.target);
            if (o && !o.isDisabled()) {
                for (; o; o = o.getParent()) {
                    if (o.isCapturable()) {
                        return o;
                    }
                }
            }
            return null;
        },

        /**
         * 获取原生的事件对象。
         * @public
         *
         * @return {Object} 原生的事件对象
         */
        getNative: function () {
            return this._oNative;
        },

        /**
         * 阻止事件的默认处理。
         * @public
         */
        preventDefault: function () {
            this.returnValue = false;
            if (this._oNative) {
                if (ieVersion) {
                    this._oNative.returnValue = false;
                } else {
                    this._oNative.preventDefault();
                }
            }
        },

        /**
         * 事件停止冒泡。
         * @public
         */
        stopPropagation: function () {
            this.cancelBubble = true;
            if (this._oNative) {
                if (ieVersion) {
                    this._oNative.cancelBubble = false;
                } else {
                    this._oNative.stopPropagation();
                }
            }
        },

        /**
         * 终止全部事件操作。
         * @public
         */
        exit: function () {
            this.preventDefault();
            this.stopPropagation();
        }
    });

    /**
     * 冒泡处理控件事件。
     * @private
     *
     * @param {ecui.ui.Control} start 开始冒泡的控件
     * @param {string} type 事件类型
     * @param {ecui.ui.Event} 事件对象
     * @param {ecui.ui.Control} end 终止冒泡的控件，如果不设置将一直冒泡至顶层
     */
    function bubble(start, type, event, end) {
        event = event || new ECUIEvent(type);
        event.cancelBubble = false;
        end = end || null;
        for (; start !== end; start = start.getParent()) {
            event.returnValue = undefined;
            core.triggerEvent(start, type, event);
            if (event.cancelBubble) {
                return;
            }
        }
    }

    /**
     * 设置document节点上的鼠标事件。
     * @private
     *
     * @param {Object} env 环境描述对象，保存当前的鼠标光标位置与document上的鼠标事件等
     * @param {boolean} remove 如果为true表示需要移除data上的鼠标事件，否则是添加鼠标事件
     */
    function changeHandler(env, remove) {
        for (var i = 0, func = remove ? dom.removeEventListener : dom.addEventListener, o; i < 5; ) {
            if (env[o = eventNames[i++]]) {
                func(document, o, env[o]);
            }
        }
    }

    /**
     * 获取两个控件的公共父控件。
     * @private
     *
     * @param {ecui.ui.Control} control1 控件1
     * @param {ecui.ui.Control} control2 控件2
     * @return {ecui.ui.Control} 公共的父控件，如果没有，返回 null
     */
    function getCommonParent(control1, control2) {
        if (control1 !== control2) {
            var i = 0,
                list1 = [],
                list2 = [];

            for (; control1; control1 = control1.getParent()) {
                list1.push(control1);
            }
            for (; control2; control2 = control2.getParent()) {
                list2.push(control2);
            }

            list1.reverse();
            list2.reverse();

            // 过滤父控件序列中重复的部分
            for (; list1[i] === list2[i]; i++) {}
            control1 = list1[i - 1];
        }

        return control1 || null;
    }

    /**
     * 获取当前 Element 对象绑定的 ECUI 控件。
     * 与控件关联的 Element 对象(例如通过 init 方法初始化，或者使用 $bind 方法绑定，或者使用 create、$fastCreate 方法生成控件)，会被添加一个 getControl 方法用于获取它绑定的 ECUI 控件，更多获取控件的方法参见 get。
     * @private
     *
     * @return {ecui.ui.Control} 与 Element 对象绑定的 ECUI 控件
     */
    function getControlByElement() {
        return this._cControl;
    }

    /**
     * 初始化ECUI工作环境。
     * @private
     *
     * @return {boolean} 是否执行了初始化操作
     */
    function initEnvironment() {
        if (!namedControls) {
            // 设置全局事件处理
            for (var key in currEnv) {
                if (currEnv.hasOwnProperty(key)) {
                    dom.addEventListener(document, key, currEnv[key]);
                }
            }

            namedControls = {};

            dom.insertHTML(document.body, 'BEFOREEND', '<div class="ui-valid"><div></div></div>');
            // 检测Element宽度与高度的计算方式
            var o = document.body.lastChild;
            flgFixedOffset = o.lastChild.offsetTop;
            scrollNarrow = o.offsetWidth - o.clientWidth - 2;
            dom.remove(o);

            o = core.getOptions(document.body, 'data-ecui') || {};

            ecuiName = o.name || ecuiName;
            isGlobalId = o.globalId;

            if (o.load) {
                o.load.split(',').forEach(function (item) {
                    try {
                        core[item].load();
                    } catch (ignore) {
                    }
                });
            }

            dom.addEventListener(window, 'resize', core.repaint);
            dom.addEventListener(
                window,
                'unload',
                function () {
                    allControls.forEach(function (item) {
                        item.$dispose();
                    });

                    // 清除闭包中引用的 Element 对象
                    unmasks.forEach(function (item) {
                        item(true);
                    });
                    maskElements = null;
                }
            );
            dom.addEventListener(window, 'scroll', onscroll);

            core.init(document.body);

            return true;
        }
    }

    /**
     * 判断是否为允许的双击时间间隔。
     * @private
     *
     * @return {boolean} 是否为允许的双击时间间隔
     */
    function isDblClick() {
        return lastClick.time > Date.now() - 200;
    }

    /**
     * 判断点击是否发生在滚动条区域。
     * @private
     *
     * @param {ecui.ui.Event} event 事件对象
     * @return {boolean} 点击是否发生在滚动条区域
     */
    function isScrollClick(event) {
        var target = event.target,
            pos = dom.getPosition(target),
            style = dom.getStyle(target),
            x = event.pageX - pos.left - util.toNumber(style.borderLeftWidth) - target.clientWidth,
            y = event.pageY - pos.top - util.toNumber(style.borderTopWidth) - target.clientHeight;

        return (target.clientWidth && target.clientWidth !== target.scrollWidth && y >= 0 && y < scrollNarrow) !== (target.clientHeight && target.clientHeight !== target.scrollHeight && x >= 0 && x < scrollNarrow);
    }

    /**
     * 处理鼠标点击。
     * @private
     *
     * @param {ecui.ui.Control} control 需要操作的控件
     * @param {ecui.ui.Event} event 事件对象
     */
    function mousedown(control, event) {
        bubble(activedControl = control, 'activate', event);
        bubble(control, 'mousedown', event);
        onselectstart(control, event);
    }

    /**
     * 控件对象创建后的处理。
     * @private
     *
     * @param {ecui.ui.Control} control
     * @param {Object} options 控件初始化选项
     */
    function oncreate(control, options) {
        if (control.oncreate) {
            control.oncreate(options);
        }
        allControls.push(control);

        if (options.id) {
            namedControls[options.id] = control;
            control.$ID = options.id;
            if (isGlobalId) {
                window[util.toCamelCase(options.id)] = control;
            }
        }

        if (options.ext) {
            for (var o in options.ext) {
                if (options.ext.hasOwnProperty(o)) {
                    if (ext[o]) {
                        ext[o](control, options.ext[o], options);
                        if (o = control['$init' + o.charAt(0).toUpperCase() + util.toCamelCase(o.slice(1))]) {
                            o.call(control, options);
                        }
                    }
                }
            }
        }
    }

    /**
     * 窗体滚动时的事件处理。
     * @private
     */
    function onscroll(event) {
        event = core.wrapEvent(event);
        independentControls.forEach(function (item) {
            core.triggerEvent(item, 'pagescroll', event);
        });
        core.mask(true);
    }

    /**
     * 文本选择开始处理。
     * @private
     *
     * @param {ecui.ui.Control} control 需要操作的控件
     * @param {ecui.ui.Event} event 事件对象
     */
    function onselectstart(control, event) {
        for (; control; control = control.getParent()) {
            if (!control.isUserSelect()) {
                event.preventDefault();
                return;
            }
        }
    }

    /**
     * 事件捕获取消。
     * @private
     */
    function releaseCapture() {
        touchCount--;

        if (ieVersion < 9) {
            // 设置IE的窗体外事件捕获，如果普通状态也设置，会导致部分区域无法点击
            document.body.releaseCapture();
        }
    }

    /**
     * 事件捕获设置，用于保证mousedown一定收到mouseup事件。
     * @private
     */
    function setCapture() {
        touchCount++;

        if (ieVersion < 9) {
            // 设置IE的窗体外事件捕获，如果普通状态也设置，会导致部分区域无法点击
            document.body.setCapture();
        }
    }

    /**
     * 设置 ecui 环境。
     * @private
     *
     * @param {Object} env 环境描述对象
     */
    function setEnv(env) {
        var o = {};
        changeHandler(currEnv, true);

        util.extend(o, currEnv);
        util.extend(o, env);
        o.x = mouseX;
        o.y = mouseY;
        changeHandler(o);

        envStack.push(currEnv);
        currEnv = o;
    }

    util.extend(core, {
        /**
         * 使一个 Element 对象与一个 ECUI 控件 在逻辑上绑定。
         * 一个 Element 对象只能绑定一个 ECUI 控件，Element 对象通过 getControl方法获取绑定的 ECUI 控件，重复绑定会自动取消之前的绑定。
         * @protected
         *
         * @param {HTMLElement} el Element 对象
         * @param {ecui.ui.Control} control ECUI 控件
         */
        $bind: function (el, control) {
            el._cControl = control;
            el.getControl = getControlByElement;
        },

        /**
         * 清除控件的状态。
         * 控件在销毁、隐藏与失效等情况下，需要使用 $clearState 方法清除已经获得的焦点与激活等状态。
         * @protected
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        $clearState: function (control) {
            var o = control.getParent();

            core.loseFocus(control);
            if (control.contain(activedControl)) {
                bubble(activedControl, 'deactivate', null, activedControl = o);
            }
            if (control.contain(hoveredControl)) {
                bubble(hoveredControl, 'mouseout', null, hoveredControl = o);
            }
        },

        /**
         * 创建 ECUI 控件。
         * $create 方法创建控件时不会自动渲染控件。在大批量创建控件时，为了加快渲染速度，应该首先使用 $create 方法创建所有控件完成后，再批量分别调用控件的 cache、init 与 repaint 方法渲染控件。options 对象支持的属性如下：
         * id         {string} 当前控件的 id，提供给 delegate 与 get 方法使用
         * main       {HTMLElement} 与控件绑捆的 Element 对象(参见 getMain 方法)，如果忽略此参数将创建 Element 对象与控件绑捆
         * parent     {ecui.ui.Control} 父控件对象或者父 Element 对象
         * primary    {string} 控件的基本样式(参见 getMainClass 方法)，如果忽略此参数将使用主元素的 className 属性
         * @protected
         *
         * @param {Function} type 控件的构造函数
         * @param {Object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        $create: function (type, options) {
            options = options || {};

            var parent = options.parent,
                el = options.main,
                primary = options.primary || options.id || '',
                className;

            options.uid = 'ecui-' + (++uniqueIndex);

            if (el) {
                // 如果指定的元素已经初始化，直接返回
                if (el.getControl) {
                    return el.getControl();
                }

                if (type.CLASS || primary) {
                    el.className = className = el.className + ' ' + primary + type.CLASS;
                } else {
                    className = el.className;
                }

                // 如果没有指定基本样式，使用控件的样式作为基本样式
                /\s*([^\s]+)/.test(className);
                options.primary = RegExp.$1;
            } else {
                // 没有传入主元素，需要自动生成，此种情况比较少见，不推荐使用
                el = options.main = dom.create(primary + type.CLASS);
                if (!primary) {
                    options.primary = type.TYPES[0];
                }
            }

            // 生成控件
            type = new type.constructor(el, options);

            if (parent) {
                if (parent instanceof ui.Control) {
                    type.setParent(parent);
                } else {
                    type.appendTo(parent);
                }
            } else {
                type.$setParent(core.findControl(dom.getParent(type.getOuter())));
            }

            oncreate(type, options);
            independentControls.push(type);

            // 处理所有的委托操作，参见delegate
            if (el = delegateControls[options.id]) {
                delete delegateControls[options.id];
                el.forEach(function (item) {
                    item.args[0] = type;
                    item.func.apply(item.caller, item.args);
                });
            }

            return type;
        },

        /**
         * 快速创建 ECUI 控件。
         * $fastCreate 方法仅供控件生成自己的部件使用，生成的控件不在控件列表中注册，不自动刷新也不能通过 query 方法查询(参见 $create 方法)。$fastCreate 方法通过分解 Element 对象的 className 属性得到样式信息，其中第一个样式为类型样式，第二个样式为基本样式。
         * @protected
         *
         * @param {Function} type 控件的构造函数
         * @param {HTMLElement} el 控件对应的 Element 对象
         * @param {ecui.ui.Control} parent 控件的父控件
         * @param {Object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        $fastCreate: function (type, el, parent, options) {
            options = options || {};

            options.uid = 'ecui-' + (++uniqueIndex);
            if (!options.primary) {
                if (/\s*([^\s]+)/.test(el.className)) {
                    options.primary = RegExp.$1;
                }
            }

            type = new type.constructor(el, options);
            type.$setParent(parent);

            oncreate(type, options);

            return type;
        },

        /**
         * 添加控件的事件监听函数。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {string} name 事件名称
         * @param {Function} func 监听函数
         */
        addEventListener: function (control, name, func) {
            name = control.getUID() + '#' + name;
            (eventListeners[name] = eventListeners[name] || []).push(func);
        },

        /**
         * 获取高度修正值(即计算 padding, border 样式对 height 样式的影响)。
         * IE 的盒子模型不完全遵守 W3C 标准，因此，需要使用 calcHeightRevise 方法计算 offsetHeight 与实际的 height 样式之间的修正值。
         * @public
         *
         * @param {CssStyle} style CssStyle 对象
         * @return {number} 高度修正值
         */
        calcHeightRevise: function (style) {
            return isStrict ? util.toNumber(style.borderTopWidth) + util.toNumber(style.borderBottomWidth) + util.toNumber(style.paddingTop) + util.toNumber(style.paddingBottom)
                : 0;
        },

        /**
         * 获取左定位修正值(即计算 border 样式对 left 样式的影响)。
         * opera 等浏览器，offsetLeft 与 left 样式的取值受到了 border 样式的影响，因此，需要使用 calcLeftRevise 方法计算 offsetLeft 与实际的 left 样式之间的修正值。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {number} 左定位修正值
         */
        calcLeftRevise: function (el) {
            var style = dom.getStyle(el.offsetParent);
            return !firefoxVersion || (style.overflow !== 'visible' && dom.getStyle(el, 'position') === 'absolute' ? util.toNumber(style.borderLeftWidth) * flgFixedOffset : 0);
        },

        /**
         * 获取上定位修正值(即计算 border 样式对 top 样式的影响)。
         * opera 等浏览器，offsetTop 与 top 样式的取值受到了 border 样式的影响，因此，需要使用 calcTopRevise 方法计算 offsetTop 与实际的 top 样式之间的修正值。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {number} 上定位修正值
         */
        calcTopRevise: function (el) {
            var style = dom.getStyle(el.offsetParent);
            return !firefoxVersion || (style.overflow !== 'visible' && dom.getStyle(el, 'position') === 'absolute' ? util.toNumber(style.borderTopWidth) * flgFixedOffset : 0);
        },

        /**
         * 获取宽度修正值(即计算 padding,border 样式对 width 样式的影响)。
         * IE 的盒子模型不完全遵守 W3C 标准，因此，需要使用 calcWidthRevise 方法计算 offsetWidth 与实际的 width 样式之间的修正值。
         * @public
         *
         * @param {CssStyle} style CssStyle 对象
         * @return {number} 宽度修正值
         */
        calcWidthRevise: function (style) {
            return isStrict ? util.toNumber(style.borderLeftWidth) + util.toNumber(style.borderRightWidth) + util.toNumber(style.paddingLeft) + util.toNumber(style.paddingRight)
                : 0;
        },

        /**
         * 创建 ECUI 控件。
         * 标准的创建 ECUI 控件 的工厂方法，适用于少量创建控件，生成的控件不需要任何额外的调用即可正常的显示，对于批量创建控件，请使用 $create 方法。options 对象支持的属性如下：
         * id        {string} 当前控件的 id，提供给 delegate 与 get 方法使用
         * main      {HTMLElement} 与控件绑捆的 Element 对象(参见 getMain 方法)，如果忽略此参数将创建 Element 对象与控件绑捆
         * parent    {ecui.ui.Control} 父控件对象或者父 Element 对象
         * primary   {string} 控件的基本样式(参见 getMainClass 方法)，如果忽略此参数将使用主元素的 className 属性
         * @public
         *
         * @param {string|Function} type 控件的类型名或控件的构造函数
         * @param {Object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        create: function (type, options) {
            type = core.$create('string' === typeof type ? ui[type] : type, options);
            type.cache();
            type.init(options);
            return type;
        },

        /**
         * 委托框架在指定的 ECUI 控件 生成时执行某个方法。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)方式，控件创建时，相关联控件也许还未创建。delegate 方法提供将指定的函数滞后到对应的控件创建后才调用的模式。如果 targetId 对应的控件还未创建，则调用会被搁置，直到需要的控件创建成功后，再自动执行(参见 create 方法)。
         * @public
         *
         * @param {string} targetId 被委托的 ECUI 控件 标识符，即在标签的 ecui 属性中定义的 id 值
         * @param {Object} caller 委托的对象
         * @param {Function} func 调用的函数
         * @param {Object} ... 调用的参数
         */
        delegate: function (targetId, caller, func) {
            if (targetId) {
                var target = namedControls[targetId],
                    args = Array.prototype.slice.call(arguments, 2);
                if (target) {
                    args[0] = target;
                    func.apply(caller, args);
                } else {
                    (delegateControls[targetId] = delegateControls[targetId] || []).push({caller: caller, func: func, args: args});
                }
            }
        },

        /**
         * 释放 ECUI 控件及其子控件占用的内存。
         * @public
         *
         * @param {ecui.ui.Control|HTMLElement} control 需要释放的控件对象或包含控件的 Element 对象
         */
        dispose: function (control) {

            // 判断一个控件是否位于一个DOM元素之下
            function contain(el, control) {
                for (; control; control = control.getParent()) {
                    if (dom.contain(el, control.getOuter())) {
                        return true;
                    }
                }
            }

            var type = control instanceof ui.Control,
                namedMap = {},
                o;

            if (type) {
                core.$clearState(control);
            } else {
                o = core.findControl(dom.getParent(control));
                // 以下判断需要考虑control.getOuter()物理上不属于control但逻辑上属于的情况
                if (focusedControl && contain(control, focusedControl)) {
                    core.setFocused(o);
                }
                if (activedControl && contain(control, activedControl)) {
                    bubble(activedControl, 'deactivate', null, activedControl = o);
                }
                if (hoveredControl && contain(control, hoveredControl)) {
                    bubble(hoveredControl, 'mouseout', null, hoveredControl = o);
                }
            }

            for (o in namedControls) {
                if (namedControls.hasOwnProperty(o)) {
                    namedMap[namedControls[o].getUID()] = o;
                }
            }

            // 需要删除的控件先放入一个集合中等待遍历结束后再删除，否则控件链将产生变化
            [].concat(allControls).filter(function (item, index) {
                if (type ? control.contain(item) : !!item.getOuter() && dom.contain(control, item.getOuter())) {
                    util.remove(independentControls, item);
                    if (item = namedMap[item.getUID()]) {
                        delete namedControls[item];
                    }
                    allControls.splice(index, 1);
                    return true;
                }
            }).forEach(function (item) {
                core.triggerEvent(item, 'dispose');
                if (item.getMain()) {
                    item.$dispose();
                }
            });
        },

        /**
         * 将指定的 ECUI 控件 设置为拖拽状态。
         * 只有在鼠标左键按下时，才允许调用 drag 方法设置待拖拽的 {'controls'|menu}，在拖拽操作过程中，将依次触发 ondragstart、ondragmove 与 ondragend 事件。range 参数支持的属性如下：
         * top    {number} 控件允许拖拽到的最小Y轴坐标
         * right  {number} 控件允许拖拽到的最大X轴坐标
         * bottom {number} 控件允许拖拽到的最大Y轴坐标
         * left   {number} 控件允许拖拽到的最小X轴坐标
         * @public
         *
         * @param {ecui.ui.Control} control 需要进行拖拽的 ECUI 控件对象
         * @param {ecui.ui.Event} event 事件对象
         * @param {Object} range 控件允许拖拽的范围，省略参数时，控件默认只允许在 offsetParent 定义的区域内拖拽，如果
         *                       offsetParent 是 body，则只允许在当前浏览器可视范围内拖拽
         */
        drag: function (control, event, range) {
            if (event._oNative.type === 'mousedown') {
                var el = control.getOuter(),
                    parent = el.offsetParent,
                    style = dom.getStyle(parent),
                    // 缓存，防止多次reflow
                    x = control.getX(),
                    y = control.getY();

                // 拖拽范围默认不超出上级元素区域
                util.extend(
                    dragEnv,
                    parent.tagName === 'BODY' || parent.tagName === 'HTML' ? util.getView() : {
                        top: 0,
                        right: parent.offsetWidth - util.toNumber(style.borderLeftWidth) - util.toNumber(style.borderRightWidth),
                        bottom: parent.offsetHeight - util.toNumber(style.borderTopWidth) - util.toNumber(style.borderBottomWidth),
                        left: 0
                    }
                );
                util.extend(dragEnv, range);
                dragEnv.right = Math.max(dragEnv.right - control.getWidth(), dragEnv.left);
                dragEnv.bottom = Math.max(dragEnv.bottom - control.getHeight(), dragEnv.top);

                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.position = 'absolute';

                dragEnv.target = control;
                dragEnv.actived = activedControl;
                setEnv(dragEnv);

                // 清除激活的控件，在drag中不需要针对激活控件移入移出的处理
                activedControl = undefined;

                core.triggerEvent(control, 'dragstart', event);
            }
        },

        /**
         * 从指定的 Element 对象开始，依次向它的父节点查找绑定的 ECUI 控件。
         * findControl 方法，会返回从当前 Element 对象开始，依次向它的父 Element 查找到的第一个绑定(参见 $bind 方法)的 ECUI 控件。findControl 方法一般在控件创建时使用，用于查找父控件对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {ecui.ui.Control} ECUI 控件对象，如果不能找到，返回 null
         */
        findControl: function (el) {
            for (; el; el = dom.getParent(el)) {
                if (el.getControl) {
                    return el.getControl();
                }
            }

            return null;
        },

        /**
         * 获取指定名称的 ECUI 控件。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)创建的控件，如果在 ecui 属性中指定了 id，就可以通过 get 方法得到控件，也可以在 Element 对象上使用 getControl 方法。
         * @public
         *
         * @param {string} id ECUI 控件的名称，通过 Element 对象的初始化选项 id 定义
         * @return {ecui.ui.Control} 指定名称的 ECUI 控件对象，如果不存在返回 null
         */
        get: function (id) {
            initEnvironment();
            return namedControls[id] || null;
        },

        /**
         * 获取当前处于激活状态的 ECUI 控件。
         * 激活状态，指鼠标在控件区域左键从按下到弹起的全过程，无论鼠标移动到哪个位置，被激活的控件对象不会发生改变。处于激活状态的控件及其父控件，都具有激活状态样式。
         * @public
         *
         * @return {ecui.ui.Control} 处于激活状态的 ECUI 控件，如果不存在返回 null
         */
        getActived: function () {
            return activedControl || null;
        },

        /**
         * 获取当前的初始化属性名。
         * getAttributeName 方法返回页面静态初始化(参见 ECUI 使用方式)使用的属性名，通过在 BODY 节点的 data-ecui 属性中指定，默认使用 ecui 作为初始化属性名。
         * @public
         *
         * @return {string} 当前的初始化属性名
         */
        getAttributeName: function () {
            return ecuiName;
        },

        /**
         * 获取当前处于焦点状态的控件。
         * 焦点状态，默认优先处理键盘/滚轮等特殊事件。处于焦点状态的控件及其父控件，都具有焦点状态样式。通常鼠标左键的点击将使控件获得焦点状态，之前拥有焦点状态的控件将失去焦点状态。
         * @public
         *
         * @return {ecui.ui.Control} 处于焦点状态的 ECUI 控件，如果不存在返回 null
         */
        getFocused: function () {
            return focusedControl;
        },

        /**
         * 获取当前处于悬停状态的控件。
         * 悬停状态，指鼠标当前位于控件区域。处于悬停状态的控件及其父控件，都具有悬停状态样式。
         * @public
         *
         * @return {ecui.ui.Control} 处于悬停状态的 ECUI 控件，如果不存在返回 null
         */
        getHovered: function () {
            return hoveredControl;
        },

        /**
         * 获取当前有效的键值码。
         * getKey 方法返回最近一次 keydown 事件的 keyCode/which 值，用于解决浏览器的 keypress 事件中特殊按键(例如方向键等)没有编码值的问题。
         * @public
         *
         * @return {number} 键值码
         */
        getKey: function () {
            return keyCode;
        },

        /**
         * 获取当前鼠标光标的页面X轴坐标或相对于控件内部区域的X轴坐标。
         * getMouseX 方法计算相对于控件内部区域的X轴坐标时，按照浏览器盒子模型的标准，需要减去 Element 对象的 borderLeftWidth 样式的值。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件，如果省略参数，将获取鼠标在页面的X轴坐标，否则获取鼠标相对于控件内部区域的X轴坐标
         * @return {number} X轴坐标值
         */
        getMouseX: function (control) {
            if (control) {
                control = control.getBody();
                return mouseX - dom.getPosition(control).left - util.toNumber(dom.getStyle(control, 'borderLeftWidth'));
            }
            return mouseX;
        },

        /**
         * 获取当前鼠标光标的页面Y轴坐标或相对于控件内部区域的Y轴坐标。
         * getMouseY 方法计算相对于控件内部区域的Y轴坐标时，按照浏览器盒子模型的标准，需要减去 Element 对象的 borderTopWidth 样式的值。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件，如果省略参数，将获取鼠标在页面的Y轴坐标，否则获取鼠标相对于控件内部区域的Y轴坐标
         * @return {number} Y轴坐标值
         */
        getMouseY: function (control) {
            if (control) {
                control = control.getBody();
                return mouseY - dom.getPosition(control).top - util.toNumber(dom.getStyle(control, 'borderTopWidth'));
            }
            return mouseY;
        },

        /**
         * 获取所有被命名的控件。
         * @public
         *
         * @return {Object} 所有被命名的控件集合
         */
        getNamedControls: function () {
            return util.extend({}, namedControls);
        },

        /**
         * 从 Element 对象中获取初始化选项对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @param {string} attributeName 当前的初始化属性名(参见 getAttributeName 方法)
         * @return {Object} 初始化选项对象
         */
        getOptions: function (el, attributeName) {
            attributeName = attributeName || ecuiName;

            var text = dom.getAttribute(el, attributeName),
                options;

            if (text) {
                options = {};
                el.removeAttribute(attributeName);

                for (; /^(\s*;)?\s*(ext\-)?([\w\-]+)\s*(:\s*([^;\s]+(\s+[^;\s]+)*)?\s*)?($|;)/.test(text); ) {
                    text = RegExp['$\''];

                    var info = RegExp.$4,
                        value = RegExp.$5;
                    (RegExp.$2 ? (options.ext = options.ext || {}) : options)[util.toCamelCase(RegExp.$3)] = info ? value === 'true' ? true : value === 'false' ? false : decodeURIComponent(value) : true;
                }

                if (core.onparseoptions) {
                    core.onparseoptions(options);
                }
                return options;
            }
        },

        /**
         * 获取浏览器滚动条的厚度。
         * getScrollNarrow 方法对于垂直滚动条，返回的是滚动条的宽度，对于水平滚动条，返回的是滚动条的高度。
         * @public
         *
         * @return {number} 浏览器滚动条相对窄的一边的长度
         */
        getScrollNarrow: function () {
            return scrollNarrow;
        },

        /**
         * 控件继承。
         * 如果不指定类型样式，表示使用父控件的类型样式，如果指定的类型样式以 * 符号开头，表示移除父控件的类型样式并以之后的类型样式代替。生成的子类构造函数已经使用了 constructor/TYPES/CLASS 三个属性，TYPES 属性是控件的全部类型样式，CLASS 属性是控件的全部类型样式字符串。
         * @public
         *
         * @param {Function} superClass 父控件类
         * @param {string} type 子控件的类型样式
         * @param {Function} subClass 子控件的标准构造函数，如果忽略将直接调用父控件类的构造函数
         * @param {Object} ... 控件扩展的方法
         * @return {Function} 新控件的构造函数
         */
        inherits: function (superClass, type, subClass) {
            var agent = function (options) {
                    return core.create(agent, options);
                },
                client = agent.constructor = 'function' === typeof subClass ? function (el, options) {
                    options.classes = this.constructor.TYPES.concat([options.primary || '', '']);
                    subClass.call(this, el, options);
                } : function (el, options) {
                    superClass.constructor.call(this, el, options);
                };

            if (superClass) {
                util.inherits(agent, superClass);

                if (type && type.charAt(0) === '*') {
                    (agent.TYPES = superClass.TYPES.slice())[0] = type.slice(1);
                } else {
                    agent.TYPES = (type ? [type] : []).concat(superClass.TYPES);
                }
            } else {
                // ecui.ui.Control的特殊初始化设置
                agent.TYPES = [];
            }
            agent.CLASS = agent.TYPES.length ? ' ' + agent.TYPES.join(' ') : '';

            util.inherits(client, agent);
            client.prototype.constructor = agent;

            Array.prototype.slice.call(arguments, 'function' === typeof subClass ? 3 : 2).forEach(function (item) {
                if (item['']) {
                    agent.prototype[item['']] = superClass.prototype;
                }
                util.extend(agent.prototype, item);
            });

            return agent;
        },

        /**
         * 初始化指定的 Element 对象对应的 DOM 节点树。
         * init 方法将初始化指定的 Element 对象及它的子节点，如果这些节点拥有初始化属性(参见 getAttributeName 方法)，将按照规则为它们绑定 ECUI 控件，每一个节点只会被绑定一次，重复的绑定无效。页面加载完成时，将会自动针对 document.body 执行这个方法，相当于自动执行以下的语句：ecui.init(document.body)
         * @public
         *
         * @param {Element} el Element 对象
         */
        init: function (el) {
            if (!initEnvironment() && el) {
                var list = dom.getAttribute(el, ecuiName) ? [el] : [],
                    controls = [],
                    names,
                    options;

                if (!initRecursion) {
                    // 第一层 init 循环的时候需要关闭resize事件监听，防止反复的重入
                    dom.removeEventListener(window, 'resize', core.repaint);
                }
                initRecursion++;

                Array.prototype.forEach.call(el.all || el.getElementsByTagName('*'), function (item) {
                    if (dom.getAttribute(item, ecuiName)) {
                        list.push(item);
                    }
                });

                list.forEach(function (item) {
                    if (options = core.getOptions(item)) {
                        options.main = item;
                        if (options.type) {
                            names = options.type.split('.');
                            if (names.length > 1) {
                                item = ui[names[0]];
                                for (var i = 1; i < names.length; i++) {
                                    item = item[names[i]];
                                }
                            } else {
                                item = ui[util.toCamelCase(names[0].charAt(0).toUpperCase() + options.type.slice(1))];
                            }
                        } else {
                            item = ui.Control;
                        }
                        controls.push({object: core.$create(item, options), options: options});
                    }
                });

                controls.forEach(function (item) {
                    item.object.cache();
                });
                controls.forEach(function (item) {
                    item.object.init(item.options);
                });

                initRecursion--;
                if (!initRecursion) {
                    dom.addEventListener(window, 'resize', core.repaint);
                }
            }
        },

        /**
         * 设置框架拦截之后的一次点击，并将点击事件发送给指定的 ECUI 控件。
         * intercept 方法将下一次的鼠标点击事件转给指定控件的 $intercept 方法处理，相当于拦截了一次框架的鼠标事件点击操作，框架其它的状态不会自动改变，例如拥有焦点的控件不会改变。如果 $intercept 方法不阻止冒泡，将自动调用 restore 方法。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        intercept: function (control) {
            interceptEnv.target = control;
            setEnv(interceptEnv);
        },

        /**
         * 当前是否处于按压状态
         * @public
         *
         * @return {boolean} 是否有鼠标左键未释放处于按压状态
         */
        isTouch: function () {
            return touchCount > 0;
        },

        /**
         * 使控件失去焦点。
         * loseFocus 方法不完全是 setFocused 方法的逆向行为。如果控件及它的子控件不处于焦点状态，执行 loseFocus 方法不会发生变化。如果控件或它的子控件处于焦点状态，执行 loseFocus 方法将使控件失去焦点状态，如果控件拥有父控件，此时父控件获得焦点状态。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        loseFocus: function (control) {
            if (control.contain(focusedControl)) {
                core.setFocused(control.getParent());
            }
        },

        /**
         * 使用或取消一个层遮罩整个浏览器可视化区域。
         * 遮罩层的 z-index 样式默认取值为 32767，请不要将 Element 对象的 z-index 样式设置大于 32767。当框架中至少一个遮罩层工作时，body 标签将增加一个样式 ecui-mask，IE6/7 的原生 select 标签可以使用此样式进行隐藏，解决强制置顶的问题。如果不传入任何参数，将关闭最近打开的一个遮罩层，如果要关闭指定的遮罩层，请直接调用返回的函数。
         * @public
         *
         * @param {number} opacity 透明度，如 0.5，如果省略参数将关闭遮罩层
         * @param {number} zIndex 遮罩层的 zIndex 样式值，如果省略使用 32767
         * @return {Function} 用于关闭当前遮罩层的函数
         */
        mask: function (opacity, zIndex) {
            var el = document.body,
                o = util.getView(),
                // 宽度向前扩展2屏，向后扩展2屏，是为了解决翻屏滚动的剧烈闪烁问题
                // 不直接设置为整个页面的大小，是为了解决IE下过大的遮罩层不能半透明的问题
                top = Math.max(o.top - o.height * 2, 0),
                left = Math.max(o.left - o.width * 2, 0),
                text = ';top:' + top + 'px;left:' + left + 'px;width:' + Math.min(o.width * 5, o.pageWidth - left) + 'px;height:' + Math.min(o.height * 5, o.pageHeight - top) + 'px;display:';

            if ('boolean' === typeof opacity) {
                // 仅简单的显示或隐藏当前的屏蔽层，用于resize时的重绘
                text += opacity ? 'block' : 'none';
                maskElements.forEach(function (item) {
                    item.style.cssText += text;
                });
            } else if (opacity === undefined) {
                unmasks.pop()();
            } else {
                if (!maskElements.length) {
                    dom.addClass(el, 'ecui-mask');
                }
                maskElements.push(el = el.appendChild(dom.create('ui-mask')));
                dom.setStyle(el, 'opacity', opacity);
                el.style.cssText += text + 'block;z-index:' + (zIndex || 32767);

                unmasks.push(

                    /**
                     * 关闭浮层。
                     * @public
                     *
                     * @param {boolean} unload 是否在 unload 中触发函数
                     */
                    o = function (unload) {
                        if (!unload) {
                            util.remove(maskElements, el);
                            util.timer(dom.remove, 1000, null, el);
                            el.style.display = 'none';
                            if (!maskElements.length) {
                                dom.removeClass(document.body, 'ecui-mask');
                            }
                        }
                        el = null;
                    }
                );

                return o;
            }
        },

        /**
         * 暂停框架自动初始化，暂停次数可以累加。
         * @public
         */
        pause: function () {
            pauseCount++;
        },

        /**
         * 查询满足条件的控件列表。
         * query 方法允许按多种条件组合查询满足需要的控件，如果省略条件表示不进行限制。condition参数对象支持的属性如下：
         * type   {Function} 控件的类型构造函数
         * parent {ecui.ui.Control} 控件的父控件
         * custom {Function} 自定义查询函数，传入的参数是控件对象，query 方法会将自己的 this 指针传入查询函数中
         * @public
         *
         * @param {Object} condition 查询条件，如果省略将返回全部的控件
         * @return {Array} 控件列表
         */
        query: function (condition) {
            condition = condition || {};
            return independentControls.filter(function (item) {
                if ((!condition.type || (item instanceof condition.type)) && (condition.parent === undefined || condition.parent === item.getParent()) && (!condition.custom || condition.custom.call(this, item))) {
                    return item;
                }
            });
        },

        /**
         * 移除控件的事件监听器。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        removeControlListener: function (control) {
            var name = control.getUID() + '#',
                len = name.length;
            for (var key in eventListeners) {
                if (eventListeners.hasOwnProperty(key)) {
                    if (key.slice(0, len) === name) {
                        delete eventListeners[key];
                    }
                }
            }
        },

        /**
         * 移除控件的事件监听函数。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {string} name 事件名称
         * @param {Function} func 监听函数
         */
        removeEventListener: function (control, name, func) {
            if (name = eventListeners[control.getUID() + '#' + name]) {
                util.remove(name, func);
            }
        },

        /**
         * 重绘浏览器区域的控件。
         * repaint 方法在页面改变大小时自动触发，一些特殊情况下，例如包含框架的页面，页面变化时不会触发 onresize 事件，需要手工调用 repaint 函数重绘所有的控件。
         * @public
         */
        repaint: function () {
            function filter(control) {
                if (control.isShow() && control.isResizable()) {
                    list.push(control);
                }
            }

            if (ieVersion) {
                // 防止 ie6/7 下的多次重入
                widthList = (isStrict ? document.documentElement : document.body).clientWidth;
                if (lastClientWidth !== widthList) {
                    lastClientWidth = widthList;
                } else {
                    // 如果高度发生变化，相当于滚动条的信息发生变化，因此需要产生scroll事件进行刷新
                    onscroll(new ECUIEvent('scroll'));
                    return;
                }
            }

            // 隐藏所有遮罩层
            core.mask(false);

            // 改变窗体大小需要清空拖拽状态
            if (currEnv.type === 'drag') {
                currEnv.mouseup(new ECUIEvent('mouseup'));
            }

            independentControls.forEach(function (item) {
                core.triggerEvent(item, 'pageresize');
            });

            // 按广度优先查找所有正在显示的控件，保证子控件一定在父控件之后
            for (var i = 0, list = [], resizeList = null, widthList; resizeList !== undefined; resizeList = list[i++]) {
                core.query({parent: resizeList}).forEach(filter);
            }

            resizeList = list.filter(function (item) {
                core.triggerEvent(item, 'resize', widthList = new ECUIEvent('repaint'));
                // 这里与Control控件的$resize方法存在强耦合，repaint有值表示在$resize中没有进行针对ie的width值回填
                if (widthList.repaint) {
                    return item;
                }
            });

            if (resizeList.length) {
                // 由于强制设置了100%，因此改变ie下控件的大小必须从内部向外进行
                // 为避免多次reflow，增加一次循环
                widthList = resizeList.map(function (item) {
                    return item.getMain().offsetWidth;
                });
                resizeList.forEach(function (item, index) {
                    item.getMain().style.width = widthList[index] - (isStrict ? item.$getBasicWidth() * 2 : 0) + 'px';
                });
            }

            list.forEach(function (item) {
                item.cache(true, true);
            });
            list.forEach(function (item) {
                item.$setSizeByCache(item.getWidth(), item.getHeight());
            });

            if (ieVersion < 8) {
                // 解决 ie6/7 下直接显示遮罩层，读到的浏览器大小实际未更新的问题
                util.timer(core.mask, 0, null, true);
            } else {
                core.mask(true);
            }
        },

        /**
         * 恢复当前框架的状态到上一个状态。
         * restore 用于恢复调用特殊操作如 drag 与 intercept 后改变的框架环境，包括各框架事件处理函数的恢复、控件的焦点设置等。
         * @public
         */
        restore: function () {
            changeHandler(currEnv, true);
            changeHandler(currEnv = envStack.pop());
        },

        /**
         * 触发框架自动初始化，减少暂停次数，到零时触发初始化。
         * @public
         */
        resume: function () {
            pauseCount--;
            if (!pauseCount) {
                if (document.body) {
                    core.init();
                }
            } else if (pauseCount < 0) {
                pauseCount = 0;
            }
        },

        /**
         * 使 ECUI 控件 得到焦点。
         * setFocused 方法将指定的控件设置为焦点状态，允许不指定需要获得焦点的控件，则当前处于焦点状态的控件将失去焦点，需要将处于焦点状态的控件失去焦点还可以调用 loseFocus 方法。如果控件处于失效状态，设置它获得焦点状态将使所有控件失去焦点状态。需要注意的是，如果控件处于焦点状态，当通过 setFocused 方法设置它的子控件获得焦点状态时，虽然处于焦点状态的控件对象发生了变化，但是控件不会触发 onblur 方法，此时控件逻辑上仍然处于焦点状态。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        setFocused: function (control) {
            if (!control || control.isDisabled()) {
                // 处于失效状态的控件不允许获得焦点状态
                control = null;
            }

            var parent = getCommonParent(focusedControl, control);

            bubble(focusedControl, 'blur', null, parent);
            bubble(focusedControl = control, 'focus', null, parent);
        },

        /**
         * 触发事件。
         * triggerEvent 会根据事件返回值或 event 的新状态决定是否触发默认事件处理。
         * @public
         *
         * @param {ecui.ui.Control} control 控件对象
         * @param {string} name 事件名
         * @param {ecui.ui.Event} event 事件对象，可以为 false 表示直接阻止默认事件处理
         * @param {Object} ... 事件的其它参数
         * @return {boolean} 是否阻止默认事件处理
         */
        triggerEvent: function (control, name, event) {
            // 防止事件重入
            var uid = control.getUID(),
                args = Array.prototype.slice.call(arguments, 2),
                listeners;

            eventStack[uid] = eventStack[uid] || {};
            if (eventStack[uid][name]) {
                return;
            }
            eventStack[uid][name] = true;

            if (!(event instanceof ECUIEvent)) {
                event = new ECUIEvent(name);
            } else {
                event.type = name;
            }

            // 检查事件是否被监听
            if (listeners = eventListeners[uid + '#' + name]) {
                listeners.forEach(function (item) {
                    if (item) {
                        item.apply(control, args);
                    }
                });
            }

            if ((control['on' + name] && control['on' + name].apply(control, args) === false) || event.returnValue === false || (control['$' + name] && control['$' + name].apply(control, args) === false)) {
                event.preventDefault();
            }

            delete eventStack[uid][name];
            return event.returnValue !== false;
        },

        /**
         * 包装事件对象。
         * event 方法将浏览器产生的鼠标与键盘事件标准化并添加 ECUI 框架需要的信息到事件对象中。标准化的属性如下：
         * pageX           {number} 鼠标的X轴坐标
         * pageY           {number} 鼠标的Y轴坐标
         * which           {number} 触发事件的按键码
         * target          {HTMLElement} 触发事件的 Element 对象
         * returnValue     {boolean}  是否进行默认处理
         * cancelBubble    {boolean}  是否取消冒泡
         * exit            {Function} 终止全部事件操作
         * getControl      {Function} 获取触发事件的 ECUI 控件 对象
         * getNative       {Function} 获取原生的事件对象
         * preventDefault  {Function} 阻止事件的默认处理
         * stopPropagation {Function} 事件停止冒泡
         * @public
         *
         * @param {Event} event 事件对象
         * @return {ecui.ui.Event} 标准化后的事件对象
         */
        wrapEvent: function (event) {
            if (event instanceof ECUIEvent) {
                // 防止事件对象被多次包装
                return event;
            }

            var body = document.body,
                html = dom.getParent(body);

            if (ieVersion < 9) {
                event = window.event;
                event.pageX = html.scrollLeft + body.scrollLeft - html.clientLeft + (event.touches ? event.touches[0].clientX : event.clientX) - body.clientLeft;
                event.pageY = html.scrollTop + body.scrollTop - html.clientTop + (event.touches ? event.touches[0].clientY : event.clientY) - body.clientTop;
                event.target = event.srcElement;
                event.which = event.keyCode || (event.button | 1);
            }

            if (event.type === 'mousemove') {
                lastClick = null;
            }
            mouseX = event.pageX;
            mouseY = event.pageY;

            return new ECUIEvent(event.type, event);
        }
    });

    function onmousewheel(event, detail) {
        event = core.wrapEvent(event);
        event.detail = detail;

        // 拖拽状态下，不允许滚动
        if (currEnv.type === 'drag') {
            event.preventDefault();
        } else {
            bubble(hoveredControl, 'mousewheel', event);
            if (!event.cancelBubble) {
                bubble(focusedControl, 'mousewheel', event);
            }
        }
    }

    dom.ready(function () {
        if (!pauseCount) {
            core.init();
        }
    });
}());

/*
Control - ECUI 的核心组成部分，定义所有控件的基本操作。
基础控件是 ECUI 的核心组成部分，对 DOM 树上的节点区域进行封装。基础控件扩展了 Element 节点的标准事件(例如得到与失去焦点、激活等)，提供了方法对控件的基本属性(例如控件大小、位置与显示状态等)进行改变，是一切控件实现的基础。基本控件拥有四种状态：焦点(focus)、悬停(hover)、激活(active)与失效(disabled)。控件在创建过程中分为三个阶段：首先是填充控件所必须的 DOM 结构，然后缓存控件的属性信息，最后进行初始化真正的渲染并显示控件。

基础控件直接HTML初始化的例子，id指定名称，可以通过ecui.get(id)的方式访问控件:
<div ui="type:control;id:demo">
  <!-- 这里放控件包含的内容 -->
  ...
</div>
<div ui="id:demo">
  <!-- 这里放控件包含的内容 -->
  ...
</div>

属性
_bCapturable        - 控件是否响应浏览器事件状态
_bUserSelect        - 控件是否允许选中内容
_bFocusable         - 控件是否允许获取焦点
_bDisabled          - 控件的状态，为true时控件不处理任何事件
_bDragListen        - 控件是否允许其它控件drag的时候触发移入移出事件
_bCached            - 控件是否已经读入缓存
_bReady             - 控件是否已经完全生成
_sUID               - 控件的内部ID
_sPrimary           - 控件定义时的基本样式
_sClass             - 控件的当前样式
_sWidth             - 控件的基本宽度值，可能是百分比或者空字符串
_sHeight            - 控件的基本高度值，可能是百分比或者空字符串
_eMain              - 控件的基本标签对象
_eBody              - 控件用于承载子控件的载体标签，通过$setBody函数设置这个值，绑定当前控件
_cParent            - 父控件对象
_aStatus            - 控件当前的状态集合
$$width             - 控件的宽度缓存
$$height            - 控件的高度缓存
$$border            - 边框线宽度缓存
$$padding           - 内填充宽度缓存
*/
(function () {

    var waitReadyList;

    /**
     * 设置控件的父对象。
     * @private
     *
     * @param {ecui.ui.Control} parent 父控件对象
     * @param {HTMLElement} parentElement 父 Element 对象
     */
    function alterParent(parent, parentElement) {
        var oldParent = this._cParent,
            el = this.getOuter();

        // 触发原来父控件的移除子控件事件
        if (parent !== oldParent) {
            if (oldParent) {
                if (!core.triggerEvent(oldParent, 'remove', this)) {
                    return;
                }
            }
            if (parent) {
                if (!core.triggerEvent(parent, 'append', this)) {
                    parent = parentElement = null;
                }
            }
        }

        if (parentElement !== dom.getParent(el)) {
            if (parentElement) {
                parentElement.appendChild(el);
            } else {
                dom.remove(el);
            }
            // 当 DOM 树位置发生改变时，$setParent必须被执行
            this.$setParent(parent);
        }
    }

    /**
     * 初始化基础控件。
     * options 对象支持的属性如下：
     * type       控件的类型样式
     * primary    控件的基本样式
     * current    控件的当前样式
     * capturable 是否需要捕获鼠标事件，默认捕获
     * userSelect 是否允许选中内容，默认允许
     * focusable  是否允许获取焦点，默认允许
     * resizable  是否允许改变大小，默认不允许
     * dragListen 是否允许在其它控件drag的时候触发移入移出事件，默认不允许
     * disabled   是否失效，默认有效
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Control = core.inherits(
        null,
        '',
        function (el, options) {
            core.$bind(el, this);

            this._bDisabled = !!options.disabled;
            this._sUID = options.uid;
            this._sPrimary = options.primary || '';
            this._sClass = options.current || this._sPrimary;
            this._eMain = this._eBody = el;

            this._bCapturable = options.capturable !== false;
            this._bUserSelect = options.userSelect !== false;
            this._bFocusable = options.focusable !== false;
            if (options.resizable) {
                this._bResizable = true;
                this._sWidth = el.style.width;
                this._sHeight = el.style.height;
            } else {
                this._bResizable = false;
            }
            this._bDragListen = options.dragListen === true;

            this._aStatus = ['', ' '];
        },
        {
            /**
             * 控件获得激活事件的默认处理。
             * 控件获得激活时，添加状态样式 -active。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $activate: function () {
                this.alterClass('+active');
            },

            /**
             * 控件是否允许在其它控件drag的时候响应移入移出事件。
             * @protected
             *
             * @return {boolean} 是否允许在其它控件drag的时候响应移入移出事件
             */
            $allowDragListen: function () {
                return this._bDragListen;
            },

            /**
             * 控件添加子控件的默认处理。
             * @protected
             *
             * @param {ecui.ui.Control} child 子控件
             */
            $append: util.blank,

            /**
             * 控件失去焦点事件的默认处理。
             * 控件失去焦点时，移除状态样式 -focus。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $blur: function () {
                this.alterClass('-focus');
            },

            /**
             * 缓存控件的属性。
             * $cache 方法缓存部分控件属性的值，在初始化时避免频繁的读写交替操作，加快渲染的速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
             * @protected
             *
             * @param {CssStyle} style 主元素的 Css 样式对象
             * @param {boolean} cacheSize 是否需要缓存控件的大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
             */
            $cache: function (style, cacheSize) {
                if (ieVersion < 8) {
                    var o = style.borderWidth.split(' ');
                    this.$$border = [util.toNumber(o[0])];
                    this.$$border[1] = o[1] ? util.toNumber(o[1]) : this.$$border[0];
                    this.$$border[2] = o[2] ? util.toNumber(o[2]) : this.$$border[0];
                    this.$$border[3] = o[3] ? util.toNumber(o[3]) : this.$$border[1];
                    o = style.padding.split(' ');
                    this.$$padding = [util.toNumber(o[0])];
                    this.$$padding[1] = o[1] ? util.toNumber(o[1]) : this.$$padding[0];
                    this.$$padding[2] = o[2] ? util.toNumber(o[2]) : this.$$padding[0];
                    this.$$padding[3] = o[3] ? util.toNumber(o[3]) : this.$$padding[1];
                } else {
                    this.$$border = [util.toNumber(style.borderTopWidth), util.toNumber(style.borderRightWidth), util.toNumber(style.borderBottomWidth), util.toNumber(style.borderLeftWidth)];
                    this.$$padding = [util.toNumber(style.paddingTop), util.toNumber(style.paddingRight), util.toNumber(style.paddingBottom), util.toNumber(style.paddingLeft)];
                }

                if (cacheSize !== false) {
                    this.$$width = this._eMain.offsetWidth || util.toNumber(style.width) + (isStrict ? this.$getBasicWidth() : 0);
                    this.$$height = this._eMain.offsetHeight || util.toNumber(style.height) + (isStrict ? this.$getBasicHeight() : 0);
                }
            },

            /**
             * 控件失去激活事件的默认处理。
             * 控件失去激活时，移除状态样式 -active。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $deactivate: function () {
                this.alterClass('-active');
            },

            /**
             * 销毁控件的默认处理。
             * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
             * @protected
             */
            $dispose: function () {
                try {
                    if (this.ondispose) {
                        this.ondispose();
                    }
                } catch (ignore) {
                }
                core.removeControlListener(this);
                if (this._eMain) {
                    this._eMain.getControl = null;
                }
                this._eMain = this._eBody = null;
                // 取消 $ready 的操作，防止控件在 onload 结束前被 dispose，从而引发 $ready 访问的信息错误的问题
                this.$ready = util.blank;
            },

            /**
             * 控件拖拽结束的默认处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $dragend: util.blank,

            /**
             * 控件拖拽的默认处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             * @param {number} x x轴坐标
             * @param {number} y y轴坐标
             */
            $dragmove: util.blank,

            /**
             * 控件拖拽开始的默认处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $dragstart: util.blank,

            /**
             * 控件获得焦点事件的默认处理。
             * 控件获得焦点时，添加状态样式 -focus。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $focus: function () {
                this.alterClass('+focus');
            },

            /**
             * 获取控件的基本高度。
             * 控件的基本高度指控件基本区域与用户数据存放区域的高度差值，即主元素与内部元素(如果相同则忽略其中之一)的上下边框宽度(border-width)与上下内填充宽度(padding)之和。
             * @public
             *
             * @return {number} 控件的基本高度
             */
            $getBasicHeight: function () {
                return this.$$border[0] + this.$$border[2] + this.$$padding[0] + this.$$padding[2];
            },

            /**
             * 获取控件的基本宽度。
             * 控件的基本宽度指控件基本区域与用户数据存放区域的宽度差值，即主元素与内部元素(如果相同则忽略其中之一)的左右边框宽度(border-width)与左右内填充宽度(padding)之和。
             * @public
             *
             * @return {number} 控件的基本宽度
             */
            $getBasicWidth: function () {
                return this.$$border[1] + this.$$border[3] + this.$$padding[1] + this.$$padding[3];
            },

            /**
             * 获取指定的部件。
             * $getSection 方法返回控件的一个部件对象，部件对象也是 ECUI 控件，是当前控件的组成成份，不可缺少，请不要轻易的对部件对象进行操作。
             * @protected
             *
             * @param {string} name 部件名称
             * @return {ecui.ui.Control} 部件对象
             */
            $getSection: function (name) {
                return this['_u' + name];
            },

            /**
             * 隐藏控件。
             * $hide 方法直接隐藏控件，控件失去激活、悬停与焦点状态，不检查控件之前的状态，因此不会导致浏览器的刷新操作。
             * @protected
             */
            $hide: function () {
                dom.addClass(this.getOuter(), 'ui-hide');
                // 控件隐藏时需要清除状态
                core.$clearState(this);
            },

            /**
             * 控件强制拦截点击的默认处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $intercept: util.blank,

            /**
             * 鼠标移出事件的默认处理。
             * 鼠标移出控件区域时，控件失去悬停状态，移除状态样式 -hover。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $mouseout: function () {
                this.alterClass('-hover');
            },

            /**
             * 鼠标移入事件的默认处理。
             * 鼠标移入控件区域时，控件获得悬停状态，添加状态样式 -hover。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $mouseover: function () {
                this.alterClass('+hover');
            },

            /**
             * 控件对页面滚动的默认处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $pagescroll: util.blank,

            /**
             * 控件初始化完成的默认处理。
             * @protected
             *
             * @param {Object} options 初始化选项(参见 ECUI 控件)
             */
            $ready: util.blank,

            /**
             * 控件移除子控件的默认处理。
             * @protected
             *
             * @param {ecui.ui.Control} child 子控件
             */
            $remove: util.blank,

            /**
             * 控件大小变化事件的默认处理。
             * @protected
             */
            $resize: function (event) {
                this._eMain.style.width = this._sWidth;
                this._eMain.style.height = this._sHeight;
                if (ieVersion < 8) {
                    // 修复ie6/7下宽度自适应错误的问题
                    var style = dom.getStyle(this._eMain);
                    if (style.width === 'auto' && style.display === 'block') {
                        this._eMain.style.width = '100%';
                        if (event.type !== 'repaint') {
                            this._eMain.style.width = this._eMain.offsetWidth - (isStrict ? this.$getBasicWidth() * 2 : 0) + 'px';
                        } else {
                            event.repaint = true;
                        }
                    }
                }
            },

            /**
             * 设置控件的内层元素。
             * ECUI 控件 逻辑上分为外层元素、主元素与内层元素，外层元素用于控制控件自身布局，主元素是控件生成时捆绑的 Element 对象，而内层元素用于控制控件对象的子控件与文本布局，三者允许是同一个 Element 对象。
             * @protected
             *
             * @param {HTMLElement} el Element 对象
             */
            $setBody: function (el) {
                this._eBody = el;
            },

            /**
             * 直接设置父控件。
             * 相对于 setParent 方法，$setParent 方法仅设置控件对象逻辑上的父对象，不进行任何逻辑上的检查，用于某些特殊情况下的设定，如下拉框控件中的选项框子控件需要使用 $setParent 方法设置它的逻辑父控件为下拉框控件。
             * @protected
             *
             * @param {ecui.ui.Control} parent ECUI 控件对象
             */
            $setParent: function (parent) {
                this._cParent = parent;
            },

            /**
             * 设置控件的大小。
             * @protected
             *
             * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
             * @param {number} height 高度，如果不需要设置则省略此参数
             */
            $setSize: function (width, height) {
                var o = this._eMain.tagName,
                    fixedSize = isStrict && o !== 'BUTTON' && o !== 'INPUT';

                // 防止负宽度IE下出错
                if (width && (o = width - (fixedSize ? this.$getBasicWidth() : 0)) > 0) {
                    this._eMain.style.width = o + 'px';
                    this.$$width = width;
                }

                // 防止负高度IE下出错
                if (height && (o = height - (fixedSize ? this.$getBasicHeight() : 0)) > 0) {
                    this._eMain.style.height = o + 'px';
                    this.$$height = height;
                }
            },

            /**
             * 使用缓存参数设置控件的大小。
             * @protected
             *
             * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
             * @param {number} height 高度，如果不需要设置则省略此参数
             */
            $setSizeByCache: function (width, height) {
                if (this._bResizable) {
                    this.$setSize(width, height);
                }
            },

            /**
             * 显示控件。
             * $show 方法直接显示控件，不检查控件之前的状态，因此不会导致浏览器的刷新操作。
             * @protected
             */
            $show: function () {
                dom.removeClass(this.getOuter(), 'ui-hide');
                if (!this._bCached) {
                    this.cache();
                    this.$setSizeByCache(this.getWidth(), this.getHeight());
                }
            },

            /**
             * 为控件添加/移除一个扩展样式。
             * 扩展样式分别附加在类型样式与当前样式之后(参见 getTypes 与 getClass 方法)，使用-号进行分隔。如果类型样式为 ui-control，当前样式为 demo，扩展样式 hover 后，控件主元素将存在四个样式，分别为 ui-control、demo、ui-control-hover 与 demo-hover。
             * @public
             *
             * @param {string} className 扩展样式名，以+号开头表示添加扩展样式，以-号开头表示移除扩展样式
             */
            alterClass: function (className) {
                if (this._sClass) {
                    if (className.charAt(0) === '+') {
                        className = '-' + className.slice(1) + ' ';
                        dom.addClass(this._eMain, this.getTypes().concat([this._sClass, '']).join(className));
                        this._aStatus.push(className);
                    } else {
                        className += ' ';
                        dom.removeClass(this._eMain, this.getTypes().concat([this._sClass, '']).join(className));
                        util.remove(this._aStatus, className);
                    }
                }
            },

            /**
             * 将控件添加到页面元素中。
             * appendTo 方法设置父元素，并使用 findControl 查找父控件对象。如果父控件发生变化，原有的父控件若存在，将触发移除子控件事件(onremove)，并解除控件与原有父控件的关联，新的父控件若存在，将触发添加子控件事件(onappend)，如果此事件返回 false，添加失败，相当于忽略 parentElement 参数。
             * @public
             *
             * @param {HTMLElement} parentElement 父 Element 对象，忽略参数控件将移出 DOM 树
             */
            appendTo: function (parentElement) {
                alterParent.call(this, parentElement && core.findControl(parentElement), parentElement);
            },

            /**
             * 控件失去焦点状态。
             * blur 方法将使控件失去焦点状态，参见 loseFocus 方法。
             * @public
             */
            blur: function () {
                core.loseFocus(this);
            },

            /**
             * 缓存控件的属性。
             * cache 方法验证控件是否已经缓存，如果未缓存将调用 $cache 方法缓存控件属性的值。在子控件或者应用程序开发过程中，如果需要避开控件提供的方法直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
             * @public
             *
             * @param {boolean} cacheSize 是否需要缓存控件的大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
             * @param {boolean} force 是否需要强制刷新缓存，相当于之前执行了 clearCache 方法，默认不强制刷新
             */
            cache: function (cacheSize, force) {
                if (force || (this.getOuter().style.display !== 'none' && !this._bCached)) {
                    this._bCached = true;
                    this.$cache(dom.getStyle(this._eMain), cacheSize);
                }
            },

            /**
             * 控件居中显示。
             * @public
             *
             * @param {number} top y轴的坐标，如果不指定水平方向也居中
             */
            center: function (top) {
                o = this.getOuter().offsetParent;

                if (!o || o.tagName === 'BODY' || o.tagName === 'HTML') {
                    var o = util.getView(),
                        x = o.right + o.left,
                        y = o.bottom + o.top;
                } else {
                    x = o.offsetWidth;
                    y = o.offsetHeight;
                }
                this.setPosition(Math.max((x - this.getWidth()) / 2, 0), top !== undefined ? top : Math.max((y - this.getHeight()) / 2, 100));
            },

            /**
             * 清除控件的缓存。
             * 在子控件或者应用程序开发过程中，如果需要避开控件提供的方法直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
             * @public
             */
            clearCache: function () {
                this._bCached = false;
            },

            /**
             * 判断是否包含指定的控件。
             * contain 方法判断指定的控件是否逻辑上属于当前控件的内部区域，即当前控件是指定的控件的某一级父控件。
             * @public
             *
             * @param {ecui.ui.Control} control ECUI 控件
             * @return {boolean} 是否包含指定的控件
             */
            contain: function (control) {
                for (; control; control = control._cParent) {
                    if (control === this) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 控件获得失效状态。
             * 控件获得失效状态时，添加状态样式 -disabled(参见 alterClass 方法)。disable 方法导致控件失去激活、悬停、焦点状态，所有子控件的 isDisabled 方法返回 true，但不会设置子控件的失效状态样式。
             * @public
             *
             * @return {boolean} 控件失效状态是否改变
             */
            disable: function () {
                if (!this._bDisabled) {
                    this.alterClass('+disabled');
                    this._bDisabled = true;
                    core.$clearState(this);
                    return true;
                }
                return false;
            },

            /**
             * 销毁控件。
             * dispose 方法销毁控件及其所有的子控件，相当于调用 ecui.dispose(this) 方法。
             * @public
             */
            dispose: function () {
                core.dispose(this);
            },

            /**
             * 控件解除失效状态。
             * 控件解除失效状态时，移除状态样式 -disabled(参见 alterClass 方法)。enable 方法仅解除控件自身的失效状态，如果其父控件失效，isDisabled 方法返回 true。
             * @public
             *
             * @return {boolean} 控件失效状态是否改变
             */
            enable: function () {
                if (this._bDisabled) {
                    this.alterClass('-disabled');
                    this._bDisabled = false;
                    return true;
                }
                return false;
            },

            /**
             * 控件获得焦点状态。
             * 如果控件没有处于焦点状态，focus 方法将设置控件获取焦点状态，参见 isFocused 与 setFocused 方法。
             * @public
             */
            focus: function () {
                if (!this.isFocused()) {
                    core.setFocused(this);
                }
            },

            /**
             * 获取控件的内层元素。
             * getBody 方法返回用于控制子控件与文本布局的内层元素。
             * @public
             *
             * @return {HTMLElement} Element 对象
             */
            getBody: function () {
                return this._eBody;
            },

            /**
             * 获取控件内层可使用区域的高度。
             * getBodyHeight 方法返回能被子控件与文本填充的控件区域高度，相当于盒子模型的 content 区域的高度。
             * @public
             *
             * @return {number} 控件内层可使用区域的宽度
             */
            getBodyHeight: function () {
                return this.getHeight() - this.getMinimumHeight();
            },

            /**
             * 获取控件内层可使用区域的宽度。
             * getBodyWidth 方法返回能被子控件与文本填充的控件区域宽度，相当于盒子模型的 content 区域的宽度。
             * @public
             *
             * @return {number} 控件内层可使用区域的宽度
             */
            getBodyWidth: function () {
                return this.getWidth() - this.getMinimumWidth();
            },

            /**
             * 获取控件的当前样式。
             * getClass 方法返回控件当前使用的样式，扩展样式分别附加在类型样式与当前样式之后，从而实现控件的状态样式改变，详细的描述请参见 alterClass 方法。当前样式与 getPrimary 方法返回的基本样式存在区别，在控件生成初期，当前样式等于基本样式，基本样式在初始化后无法改变，setClass 方法改变当前样式。
             * @public
             *
             * @return {string} 控件的当前样式
             */
            getClass: function () {
                return this._sClass;
            },

            /**
             * 获取控件的内容。
             * @public
             *
             * @return {string} HTML 片断
             */
            getContent: function () {
                return this._eBody.innerHTML;
            },

            /**
             * 获取控件区域的高度。
             * @public
             *
             * @return {number} 控件的高度
             */
            getHeight: function () {
                this.cache();
                return this.$$height;
            },

            /**
             * 获取控件的主元素。
             * getMain 方法返回控件生成时定义的 Element 对象(参见 create 方法)。
             * @public
             *
             * @return {HTMLElement} Element 对象
             */
            getMain: function () {
                return this._eMain;
            },

            /**
             * 获取控件的最小高度。
             * setSize 方法不允许设置小于 getMinimumHeight 方法返回的高度值。
             * @public
             *
             * @return {number} 控件的最小高度
             */
            getMinimumHeight: function () {
                this.cache();
                return this.$getBasicHeight();
            },

            /**
             * 获取控件的最小宽度。
             * @public
             *
             * @return {number} 控件的最小宽度
             */
            getMinimumWidth: function () {
                this.cache();
                return this.$getBasicWidth();
            },

            /**
             * 获取控件的外层元素。
             * getOuter 方法返回用于控制控件自身布局的外层元素。
             * @public
             *
             * @return {HTMLElement} Element 对象
             */
            getOuter: function () {
                return this._eMain;
            },

            /**
             * 获取父控件。
             * 控件接收的事件将向父控件冒泡处理，getParent 返回的结果是 ECUI 的逻辑父控件，父控件与子控件不一定存在 DOM 树层面的父子级关系。
             * @public
             *
             * @return {ecui.ui.Control} 父控件对象
             */
            getParent: function () {
                return this._cParent || null;
            },

            /**
             * 获取控件的基本样式。
             * getPrimary 方法返回控件生成时指定的 primary 参数(参见 create 方法)。基本样式与通过 getClass 方法返回的当前样式存在区别，在控件生成初期，当前样式等于基本样式，基本样式在初始化后无法改变，setClass 方法改变当前样式。
             * @public
             *
             * @return {string} 控件的基本样式
             */
            getPrimary: function () {
                return this._sPrimary;
            },

            /**
             * 获取控件的类型。
             * @public
             *
             * @return {string} 控件的类型
             */
            getType: function () {
                return this.constructor.TYPES[0];
            },

            /**
             * 获取控件的类型样式组。
             * getTypes 方法返回控件的类型样式组，类型样式在控件继承时指定。
             * @public
             *
             * @return {Array} 控件的类型样式组
             */
            getTypes: function () {
                return this.constructor.TYPES.slice();
            },

            /**
             * 获取控件的内部唯一标识符。
             * getUID 方法返回的 ID 不是初始化选项中指定的 id，而是框架为每个控件生成的内部唯一标识符。
             * @public
             *
             * @return {string} 控件 ID
             */
            getUID: function () {
                return this._sUID;
            },

            /**
             * 获取控件区域的宽度。
             * @public
             *
             * @return {number} 控件的宽度
             */
            getWidth: function () {
                this.cache();
                return this.$$width;
            },

            /**
             * 获取控件的相对X轴坐标。
             * getX 方法返回控件的外层元素的 offsetLeft 属性值。如果需要得到控件相对于整个文档的X轴坐标，请调用 getOuter 方法获得外层元素，然后调用 DOM 的相关函数计算(例如 ecui.dom.getPosition)。
             * @public
             *
             * @return {number} X轴坐标
             */
            getX: function () {
                var el = this.getOuter();

                return this.isShow() ? el.offsetLeft - core.calcLeftRevise(el) : 0;
            },

            /**
             * 获取控件的相对Y轴坐标。
             * getY 方法返回控件的外层元素的 offsetTop 属性值。如果需要得到控件相对于整个文档的Y轴坐标，请调用 getOuter 方法获得外层元素，然后调用 DOM 的相关函数计算(例如 ecui.dom.getPosition)。
             * @public
             *
             * @return {number} Y轴坐标
             */
            getY: function () {
                var el = this.getOuter();

                return this.isShow() ? el.offsetTop - core.calcTopRevise(el) : 0;
            },

            /**
             * 隐藏控件。
             * 如果控件处于显示状态，调用 hide 方法会触发 onhide 事件，控件转为隐藏状态，并且控件会自动失去激活、悬停与焦点状态。如果控件已经处于隐藏状态，则不执行任何操作。
             * @public
             *
             * @return {boolean} 显示状态是否改变
             */
            hide: function () {
                if (this.isShow()) {
                    core.triggerEvent(this, 'hide');
                    return true;
                }
                return false;
            },

            /**
             * 控件初始化。
             * init 方法在控件缓存读取后调用，有关控件生成的完整过程描述请参见 基础控件。
             * @public
             *
             * @param {Object} options 初始化选项(参见 ECUI 控件)
             */
            init: function (options) {
                if (!this._bReady) {
                    if (this._bDisabled) {
                        this.alterClass('+disabled');
                    }

                    var el = this.getOuter();
                    if (el.style.display === 'none') {
                        this.$hide();
                        el.style.display = '';
                    } else {
                        this.$setSizeByCache(this.getWidth(), this.getHeight());
                    }

                    if (waitReadyList === null) {
                        // 页面已经加载完毕，直接运行 $ready 方法
                        core.triggerEvent(this, 'ready', options);
                    } else {
                        if (!waitReadyList) {
                            // 页面未加载完成，首先将 $ready 方法的调用存放在调用序列中
                            // 需要这么做的原因是 ie 的 input 回填机制，一定要在 onload 之后才触发
                            // ECUI 应该避免直接使用 ecui.get(xxx) 导致初始化，所有的代码应该在 onload 之后运行
                            waitReadyList = [];
                            util.timer(function () {
                                waitReadyList.forEach(function (item) {
                                    core.triggerEvent(item.control, 'ready', item.options);
                                });
                                waitReadyList = null;
                            }, 0);
                        }
                        if (this.$ready !== util.blank || this.onready) {
                            waitReadyList.push({control: this, options: options});
                        }
                    }
                    this._bReady = true;
                }
            },

            /**
             * 判断控件是否处于激活状态。
             * @public
             *
             * @return {boolean} 控件是否处于激活状态
             */
            isActived: function () {
                return this.contain(core.getActived());
            },

            /**
             * 判断是否响应浏览器事件。
             * 控件不响应浏览器事件时，相应的事件由父控件进行处理。
             * @public
             *
             * @return {boolean} 控件是否响应浏览器事件
             */
            isCapturable: function () {
                return this._bCapturable;
            },

            /**
             * 判断控件是否处于失效状态。
             * 控件是否处于失效状态，影响控件是否处理事件，它受到父控件的失效状态的影响。可以通过 enable 与 disable 方法改变控件的失效状态，如果控件失效，它所有的子控件也会失效
             * @public
             *
             * @return {boolean} 控件是否失效
             */
            isDisabled: function () {
                return this._bDisabled || (!!this._cParent && this._cParent.isDisabled());
            },

            /**
             * 判断是否允许获得焦点。
             * 控件不允许获得焦点时，被点击时不会改变当前处于焦点状态的控件，但此时控件拥有框架事件响应的最高优先级。
             * @public
             *
             * @return {boolean} 控件是否允许获取焦点
             */
            isFocusable: function () {
                return this._bFocusable;
            },

            /**
             * 判断控件是否处于焦点状态。
             * @public
             *
             * @return {boolean} 控件是否处于焦点状态
             */
            isFocused: function () {
                return this.contain(core.getFocused());
            },

            /**
             * 判断控件是否处于悬停状态。
             * @public
             *
             * @return {boolean} 控件是否处于悬停状态
             */
            isHovered: function () {
                return this.contain(core.getHovered());
            },

            /**
             * 判断控件是否完全生成。
             * @public
             *
             * @return {boolean} 控件是否完全生成
             */
            isReady: function () {
                return !!this._bReady;
            },

            /**
             * 判断控件是否允许改变大小。
             * @public
             *
             * @return {boolean} 控件是否允许改变大小
             */
            isResizable: function () {
                return this._bResizable;
            },

            /**
             * 判断是否处于显示状态。
             * @public
             *
             * @return {boolean} 控件是否显示
             */
            isShow: function () {
                return !!this.getOuter().offsetWidth;
            },

            /**
             * 判断是否允许选中内容。
             * @public
             *
             * @return {boolean} 控件是否允许选中内容
             */
            isUserSelect: function () {
                return this._bUserSelect;
            },

            /**
             * 控件完全刷新。
             * 对于存在数据源的控件，render 方法根据数据源重新填充控件内容，重新计算控件的大小进行完全的重绘。
             * @public
             */
            render: function () {
                this.resize();
            },

            /**
             * 控件刷新。
             * repaint 方法不改变控件的内容与大小进行重绘。控件如果生成后不位于文档 DOM 树中，样式无法被正常读取，控件显示后如果不是预期的效果，需要调用 repaint 方法刷新。
             * @public
             */
            repaint: function () {
                this.cache(true, true);
                this.$setSizeByCache(this.getWidth(), this.getHeight());
            },

            /**
             * 控件重置大小并刷新。
             * resize 方法重新计算并设置控件的大小，浏览器可视化区域发生变化时，可能需要改变控件大小，框架会自动调用控件的 resize 方法。
             */
            resize: function () {
                if (this._bResizable) {
                    this.$resize();
                    this.repaint();
                }
            },

            /**
             * 设置控件可使用区域的大小。
             * @public
             *
             * @param {number} width 宽度
             * @param {number} height 高度
             */
            setBodySize: function (width, height) {
                this.setSize(width && width + this.getMinimumWidth(), height && height + this.getMinimumHeight());
            },

            /**
             * 设置控件的当前样式。
             * setClass 方法改变控件的当前样式，扩展样式分别附加在类型样式与当前样式之后，从而实现控件的状态样式改变，详细的描述请参见 alterClass 方法。控件的当前样式通过 getClass 方法获取。
             * @public
             *
             * @param {string} currClass 控件的当前样式名称
             */
            setClass: function (currClass) {
                var oldClass = this._sClass,
                    classes = this.getTypes(),
                    list;

                currClass = currClass || this._sPrimary;

                // 如果基本样式没有改变不需要执行
                if (currClass !== oldClass) {
                    classes.splice(0, 0, this._sClass = currClass);
                    list = classes.map(function (item) {
                        return this._aStatus.join(item);
                    }, this);
                    classes[0] = oldClass;
                    this._eMain.className = list.join('') + this._eMain.className.split(/\s+/).join('  ').replace(new RegExp('(^| )(' + classes.join('|') + ')(-[^ ]+)?( |$)', 'g'), '');
                }
            },

            /**
             * 设置控件的内容。
             * @public
             *
             * @param {string} html HTML 片断
             */
            setContent: function (html) {
                this._eBody.innerHTML = html;
            },

            /**
             * 设置当前控件的父控件。
             * setParent 方法设置父控件，将当前控件挂接到父控件对象的内层元素中。如果父控件发生变化，原有的父控件若存在，将触发移除子控件事件(onremove)，并解除控件与原有父控件的关联，新的父控件若存在，将触发添加子控件事件(onappend)，如果此事件返回 false，添加失败，相当于忽略 parent 参数。
             * @public
             *
             * @param {ecui.ui.Control} parent 父控件对象，忽略参数控件将移出 DOM 树
             */
            setParent: function (parent) {
                alterParent.call(this, parent, parent && parent._eBody);
            },

            /**
             * 设置控件的坐标。
             * setPosition 方法设置的是控件的 left 与 top 样式，受到 position 样式的影响。
             * @public
             *
             * @param {number} x 控件的X轴坐标
             * @param {number} y 控件的Y轴坐标
             */
            setPosition: function (x, y) {
                var style = this.getOuter().style;
                style.left = x + 'px';
                style.top = y + 'px';
            },

            /**
             * 设置控件的大小。
             * 需要设置的控件大小如果低于控件允许的最小值，将忽略对应的宽度或高度的设置。
             * @public
             *
             * @param {number} width 控件的宽度
             * @param {number} height 控件的高度
             */
            setSize: function (width, height) {
                if (this._bResizable) {
                    this.cache();

                    // 控件新的大小不允许小于最小值
                    if (width < this.getMinimumWidth()) {
                        width = 0;
                    }
                    if (height < this.getMinimumHeight()) {
                        height = 0;
                    }

                    this.$setSize(width, height);

                    if (width) {
                        this._sWidth = this._eMain.style.width;
                    }
                    if (height) {
                        this._sHeight = this._eMain.style.height;
                    }
                }
            },

            /**
             * 显示控件。
             * 如果控件处于隐藏状态，调用 show 方法会触发 onshow 事件，控件转为显示状态。如果控件已经处于显示状态，则不执行任何操作。
             * @public
             *
             * @return {boolean} 显示状态是否改变
             */
            show: function () {
                if (!this.isShow()) {
                    core.triggerEvent(this, 'show');
                    return true;
                }
                return false;
            }
        }
    );

    // 初始化事件处理函数，以事件名命名，这些函数行为均是判断控件是否可操作/是否需要调用事件/是否需要执行缺省的事件处理，对应的缺省事件处理函数名以$开头后接事件名，处理函数以及缺省事件处理函数参数均为事件对象，仅执行一次。
    eventNames.forEach(function (item) {
        ui.Control.prototype['$' + item] = ui.Control.prototype['$' + item] || util.blank;
    });
}());


/*
Item/Items - 定义选项操作相关的基本操作。
选项控件，继承自基础控件，用于弹出菜单、下拉框、交换框等控件的单个选项，通常不直接初始化。选项控件必须用在使用选项组接口(Items)的控件中。
选项组不是控件，是一组对选项进行操作的方法的集合，提供了基本的增/删操作，通过将 ecui.ui.Items 对象下的方法复制到类的 prototype 属性下继承接口，最终对象要正常使用还需要在类构造器中调用 $initItems 方法。
*/
(function () {

    /**
     * 选项控件交互处理。
     * @private
     *
     * @param {Event} 事件对象
     */
    function onitem(event) {
        var parent = this.getParent();

        ui.Control.prototype['$' + event.type].call(this, event);

        if (parent) {
            core.triggerEvent(parent, 'item' + event.type.replace('mouse', ''), event, this);
        }
    }

    /**
     * 初始化选项控件。
     * @public
     *
     * @param {string|Object} options 对象
     */
    ui.Item = core.inherits(
        ui.Control,
        'ui-item'
    );

    ui.Items = {
        '': '$Items',

        /**
         * 选项组只允许添加选项控件，添加成功后会自动调用 $alterItems 方法。
         * @override
         */
        $append: function (child) {
            // 检查待新增的控件是否为选项控件
            if (!(child instanceof (this.Item || ui.Item)) || this.$Items.$append.call(this, child) === false) {
                return false;
            }
            ui.Items[this.getUID()].push(child);
            this.$alterItems();
        },

        /**
         * @override
         */
        $cache: function (style, cacheSize) {
            this.$Items.$cache.call(this, style, cacheSize);

            ui.Items[this.getUID()].forEach(function (item) {
                item.cache(true, true);
            });
        },

        /**
         * @override
         */
        $dispose: function () {
            delete ui.Items[this.getUID()];
            this.$Items.$dispose.call(this);
        },

        /**
         * 初始化选项组对应的内部元素对象。
         * 选项组假设选项的主元素在内部元素中，因此实现了 Items 接口的类在初始化时需要调用 $initItems 方法自动生成选项控件，$initItems 方法内部保证一个控件对象只允许被调用一次，多次的调用无效。
         * @protected
         */
        $initItems: function () {
            // 防止因为选项变化引起重复刷新，以及防止控件进行多次初始化操作
            this.$alterItems = this.$initItems = util.blank;

            ui.Items[this.getUID()] = [];

            // 初始化选项控件
            dom.children(this.getBody()).forEach(function (item) {
                this.add(item);
            }, this);

            delete this.$alterItems;
        },

        /**
         * 选项组移除子选项后会自动调用 $alterItems 方法。
         * @override
         */
        $remove: function (child) {
            core.$clearState(child);
            this.$Items.$remove.call(this, child);
            util.remove(ui.Items[this.getUID()], child);
            this.$alterItems();
        },

        /**
         * 添加子选项控件。
         * add 方法中如果位置序号不合法，子选项控件将添加在末尾的位置。
         * @public
         *
         * @param {string|HTMLElement|ecui.ui.Item} item 控件的 html 内容/控件对应的主元素对象/选项控件
         * @param {number} index 子选项控件需要添加的位置序号
         * @param {Object} options 子控件初始化选项
         * @return {ecui.ui.Item} 子选项控件
         */
        add: function (item, index, options) {
            var list = ui.Items[this.getUID()],
                o;

            this.$alterItems = util.blank;

            if (!(item instanceof ui.Item)) {
                // 根据是字符串还是Element对象选择不同的初始化方式
                if ('string' === typeof item) {
                    this.getBody().appendChild(o = dom.create('', 'LABEL'));
                    o.innerHTML = item;
                    item = o;
                }

                o = this.Item || ui.Item;
                item.className += ' ' + this.getType() + '-item' + o.CLASS;

                options = options || core.getOptions(item) || {};
                options.parent = this;
                item = core.$fastCreate(o, item, this, options);
            }

            // 选项控件，直接添加
            item.setParent(this);

            // 改变选项控件的位置
            if (item.getParent()) {
                o = item.getOuter();
                util.remove(list, item);
                if (list[index]) {
                    dom.insertBefore(o, list[index].getOuter());
                    list.splice(index, 0, item);
                } else {
                    dom.getParent(o).appendChild(o);
                    list.push(item);
                }
            }

            delete this.$alterItems;
            this.$alterItems();

            return item;
        },

        /**
         * 向选项组最后添加子选项控件。
         * append 方法是 add 方法去掉第二个 index 参数的版本。
         * @public
         *
         * @param {string|Element|ecui.ui.Item} item 控件的 html 内容/控件对应的主元素对象/选项控件
         * @param {Object} 子控件初始化选项
         * @return {ecui.ui.Item} 子选项控件
         */
        append: function (item, options) {
            this.add(item, null, options);
        },

        /**
         * 获取全部的子选项控件。
         * @public
         *
         * @return {Array} 子选项控件数组
         */
        getItems: function () {
            return ui.Items[this.getUID()].slice();
        },

        /**
         * @override
         */
        init: function (options) {
            this.$Items.init.call(this, options);
            this.$alterItems();
        },

        /**
         * 移除子选项控件。
         * @public
         *
         * @param {number|ecui.ui.Item} item 选项控件的位置序号/选项控件
         * @return {ecui.ui.Item} 被移除的子选项控件
         */
        remove: function (item) {
            if ('number' === typeof item) {
                item = ui.Items[this.getUID()][item];
            }
            if (item) {
                item.setParent();
            }
            return item || null;
        },

        /**
         * 设置控件内所有子选项控件的大小。
         * @public
         *
         * @param {number} itemWidth 子选项控件的宽度
         * @param {number} itemHeight 子选项控件的高度
         */
        setItemSize: function (itemWidth, itemHeight) {
            ui.Items[this.getUID()].forEach(function (item) {
                item.cache();
            });
            ui.Items[this.getUID()].forEach(function (item) {
                item.$setSize(itemWidth, itemHeight);
            });
        }
    };

    eventNames.every(function (item, index) {
        ui.Item.prototype['$' + item] = onitem;
        return index < 6;
    });
}());

/*
Label - 定义事件转发的基本操作。
标签控件，继承自基础控件，将事件转发到指定的控件上，通常与 Radio、Checkbox 等控件联合使用，扩大点击响应区域。

标签控件直接HTML初始化的例子:
<div ui="type:label;for:checkbox"></div>

属性
_cFor - 被转发的控件对象
*/

    /**
     * 初始化标签控件。
     * options 对象支持的属性如下：
     * for 被转发的控件 id
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Label = core.inherits(
        ui.Control,
        'ui-label',
        function (el, options) {
            ui.Control.constructor.call(this, el, options);
            core.delegate(options['for'], this, this.setFor);
        },
        {
            /**
             * 鼠标单击控件事件的默认处理。
             * 将点击事件转发到 setFor 方法指定的控件。如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
             * @protected
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);

                var control = this._cFor;
                if (control) {
                    core.triggerEvent(control, 'click', event);
                }
            },

            /**
             * 设置控件的事件转发接收控件。
             * setFor 方法设置事件转发的被动接收者，如果没有设置，则事件不会被转发。
             * @public
             *
             * @param {ecui.ui.Control} control 事件转发接收控件
             */
            setFor: function (control) {
                this._cFor = control;
            }
        }
    );


/*
Button - 定义按钮的基本操作。
按钮控件，继承自基础控件，屏蔽了激活状态的向上冒泡，并且在激活(active)状态下鼠标移出控件区域会失去激活样式，移入控件区域再次获得激活样式，按钮控件中的文字不可以被选中。

按钮控件直接HTML初始化的例子:
<div ui="type:button">
  <!-- 这里放按钮的文字 -->
  ...
</div>
或
<button ui="type:button">
  <!-- 这里放按钮的文字 -->
  ...
</button>
或
<input ui="type:button" value="按钮文字" type="button">

属性
*/

    /**
     * 初始化基础控件。
     * options 对象支持的属性如下：
     * text 按钮的文字
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Button = core.inherits(
        ui.Control,
        'ui-button',
        function (el, options) {
            util.setDefault(options, 'userSelect', false);

            if (options.text) {
                dom.setText(el, options.text);
            }

            ui.Control.constructor.call(this, el, options);
        },
        {
            /**
             * 按钮控件获得激活时需要阻止事件的冒泡。
             * @override
             */
            $activate: function (event) {
                ui.Control.prototype.$activate.call(this, event);
                event.stopPropagation();
            },

            /**
             * 如果控件处于激活状态，移除状态样式 -active，移除状态样式不失去激活状态。
             * @override
             */
            $mouseout: function (event) {
                ui.Control.prototype.$mouseout.call(this, event);
                if (this.isActived()) {
                    this.alterClass('-active');
                }
            },

            /**
             * 如果控件处于激活状态，添加状态样式 -active。
             * @override
             */
            $mouseover: function (event) {
                ui.Control.prototype.$mouseover.call(this, event);
                if (this.isActived()) {
                    this.alterClass('+active');
                }
            }
        }
    );


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
            var el = core.wrapEvent(event).target,
                control = el.getControl();
            if (control.isDisabled()) {
                dom.removeEventListener(el, 'blur', Events.blur);
                try {
                    el.blur();
                } catch (ignore) {
                }
                dom.addEventListener(el, 'blur', Events.blur);
            } else {
                control.focus();
            }
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

/*
Checkbox - 定义单个设置项选择状态的基本操作。
复选框控件，继承自输入控件，实现了对原生 InputElement 复选框的功能扩展，支持复选框之间的主从关系定义。当一个复选框的“从复选框”选中一部分时，“主复选框”将处于半选状态，这种状态逻辑意义上等同于未选择状态，但显示效果不同，复选框的主从关系可以有多级。复选框控件适用所有在一组中允许选择多个目标的交互，并不局限于此分组的表现形式(文本、图片等)。

复选框控件直接HTML初始化的例子:
<input ui="type:checkbox;subject:china" name="city" value="beijing" checked="checked" type="checkbox">
或
<div ui="type:checkbox;name:city;value:beijing;checked:true;subject:china"></div>
或
<div ui="type:checkbox;subject:china">
  <input name="city" value="beijing" checked="checked" type="checkbox">
</div>

属性
_bDefault        - 默认的选中状态
_nStatus         - 复选框当前的状态，0--全选，1--未选，2--半选
_cSubject        - 主复选框
_aDependents     - 所有的从属复选框
*/
(function () {

    /**
     * 改变复选框状态。
     * @private
     *
     * @param {number} status 新的状态，0--全选，1--未选，2--半选
     */
    function change(status) {
        if (status !== this._nStatus) {
            // 状态发生改变时进行处理
            this.setClass(this.getPrimary() + ['-checked', '', '-part'][status]);

            this._nStatus = status;

            var el = this.getInput();
            el.defaultChecked = el.checked = !status;

            // 如果有主复选框，刷新主复选框的状态
            if (this._cSubject) {
                flush.call(this._cSubject);
            }
            core.triggerEvent(this, 'change');
        }
    }

    /**
     * 复选框控件刷新，计算所有从复选框，根据它们的选中状态计算自身的选中状态。
     * @private
     */
    function flush() {
        var status;
        this._aDependents.forEach(function (item) {
            if (status !== undefined && status !== item._nStatus) {
                status = 2;
            } else {
                status = item._nStatus;
            }
        });

        if (status !== undefined) {
            change.call(this, status);
        }
    }

    /**
     * 初始化复选框控件。
     * options 对象支持的属性如下：
     * subject 主复选框 ID，会自动与主复选框建立关联后，作为主复选框的从属复选框之一
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Checkbox = core.inherits(
        ui.InputControl,
        'ui-checkbox',
        function (el, options) {
            util.setDefault(options, 'hidden', true);
            util.setDefault(options, 'inputType', 'checkbox');

            ui.InputControl.constructor.call(this, el, options);

            // 保存节点选中状态，用于修复IE6/7下移动DOM节点时选中状态发生改变的问题
            this._bDefault = this.getInput().defaultChecked;
            this._aDependents = [];

            core.delegate(options.subject, this, this.setSubject);
        },
        {
            /**
             * 控件点击时改变当前的选中状态。
             * @override
             */
            $click: function (event) {
                ui.InputControl.prototype.$click.call(this, event);
                this.setChecked(!!this._nStatus);
            },

            /**
             * @override
             */
            $dispose: function () {
                this.setSubject();
                this._aDependents.forEach(function (item) {
                    item._cSubject = null;
                });
                ui.InputControl.prototype.$dispose.call(this);
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keydown: function (event) {
                ui.InputControl.prototype.$keydown.call(this, event);
                if (event.which === 32) {
                    event.preventDefault();
                }
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keypress: function (event) {
                ui.InputControl.prototype.$keypress.call(this, event);
                if (event.which === 32) {
                    event.preventDefault();
                }
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keyup: function (event) {
                ui.InputControl.prototype.$keyup.call(this, event);
                if (event.which === 32) {
                    if (core.getKey() === 32) {
                        this.setChecked(!!this._nStatus);
                    }
                    event.preventDefault();
                }
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.InputControl.prototype.$ready.call(this, options);
                if (!this._aDependents.length) {
                    // 如果控件是主复选框，应该直接根据从属复选框的状态来显示自己的状态
                    change.call(this, this.getInput().checked ? 0 : 1);
                }
            },

            /**
             * @override
             */
            $reset: function (event) {
                // 修复IE6/7下移动DOM节点时选中状态发生改变的问题
                this.getInput().checked = this._bDefault;
                ui.InputControl.prototype.$reset.call(this, event);
            },

            /**
             * 获取全部的从属复选框。
             * 复选框控件调用 setSubject 方法指定了主复选框后，它就是主复选框的从属复选框之一。
             * @public
             *
             * @return {Array} 复选框控件数组
             */
            getDependents: function () {
                return this._aDependents.slice();
            },

            /**
             * 获取主复选框。
             * getSubject 方法返回调用 setSubject 方法指定的主复选框控件。
             * @public
             *
             * @return {ecui.ui.Checkbox} 复选框控件
             */
            getSubject: function () {
                return this._cSubject || null;
            },

            /**
             * 判断控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return !this._nStatus;
            },

            /**
             * 设置复选框控件选中状态。
             * @public
             *
             * @param {boolean} checked 是否选中
             */
            setChecked: function (checked) {
                change.call(this, checked ? 0 : 1);
                // 如果有从属复选框，全部改为与当前复选框相同的状态
                this._aDependents.forEach(function (item) {
                    item._cSubject = null;
                    item.setChecked(checked);
                    item._cSubject = this;
                }, this);

            },

            /**
             * 设置主复选框。
             * setSubject 方法指定主复选框控件后，可以通过访问主复选框控件的 getDependents 方法获取列表，列表中即包含了当前的控件。请注意，控件从 DOM 树上被移除时，不会自动解除主从关系，联动可能出现异常，此时请调用 setSubject 方法传入空参数解除主从关系。
             * @public
             *
             * @param {ecui.ui.Checkbox} checkbox 主复选框
             */
            setSubject: function (checkbox) {
                var oldSubject = this._cSubject;
                if (oldSubject !== checkbox) {
                    this._cSubject = checkbox;

                    if (oldSubject) {
                        // 已经设置过主复选框，需要先释放引用
                        util.remove(oldSubject._aDependents, this);
                        flush.call(oldSubject);
                    }

                    if (checkbox) {
                        checkbox._aDependents.push(this);
                        flush.call(checkbox);
                    }
                }
            }
        }
    );
}());

/*
Radio - 定义一组选项中选择唯一选项的基本操作。
单选框控件，继承自输入框控件，实现了对原生 InputElement 单选框的功能扩展，支持对选中的图案的选择。单选框控件适用所有在一组中只允许选择一个目标的交互，并不局限于此分组的表现形式(文本、图片等)。

单选框控件直接HTML初始化的例子:
<input ui="type:radio" name="city" value="beijing" checked="checked" type="radio">
或
<div ui="type:radio;name:city;value:beijing;checked:true"></div>
或
<div ui="type:radio">
  <input name="city" value="beijing" checked="checked" type="radio">
</div>

属性
_bDefault  - 默认的选中状态
*/
(function () {

    /**
     * 单选框控件刷新。
     * @private
     *
     * @param {boolean} checked 新的状态，如果忽略表示不改变当前状态
     */
    function flush(checked) {
        if (checked !== undefined) {
            var el = this.getInput();
            el.defaultChecked = el.checked = checked;
        }
        this.setClass(this.getPrimary() + (this.isChecked() ? '-checked' : ''));
    }

    /**
     * 初始化单选框控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Radio = core.inherits(
        ui.InputControl,
        'ui-radio',
        function (el, options) {
            util.setDefault(options, 'hidden', true);
            util.setDefault(options, 'inputType', 'radio');

            ui.InputControl.constructor.call(this, el, options);

            // 保存节点选中状态，用于修复IE6/7下移动DOM节点时选中状态发生改变的问题
            this._bDefault = this.getInput().defaultChecked;
        },
        {
            /**
             * 控件点击时将控件设置成为选中状态，同时取消同一个单选框控件组的其它控件的选中状态。
             * @override
             */
            $click: function (event) {
                ui.InputControl.prototype.$click.call(this, event);
                this.setChecked(true);
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keydown: function (event) {
                ui.InputControl.prototype.$keydown.call(this, event);
                if (event.which === 32) {
                    event.preventDefault();
                }
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keypress: function (event) {
                ui.InputControl.prototype.$keypress.call(this, event);
                if (event.which === 32) {
                    event.preventDefault();
                }
            },

            /**
             * 接管对空格键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keyup: function (event) {
                ui.InputControl.prototype.$keyup.call(this, event);
                if (event.which === 32) {
                    if (core.getKey() === 32) {
                        this.setChecked(true);
                    }
                    event.preventDefault();
                }
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.InputControl.prototype.$ready.call(this, options);
                flush.call(this);
            },

            /**
             * @override
             */
            $reset: function (event) {
                // 修复IE6/7下移动DOM节点时选中状态发生改变的问题
                this.getInput().checked = this._bDefault;
                ui.InputControl.prototype.$reset.call(this, event);
            },

            /**
             * 获取与当前单选框同组的全部单选框。
             * getItems 方法返回包括当前单选框在内的与当前单选框同组的全部单选框，同组的单选框选中状态存在唯一性。
             * @public
             *
             * @return {Array} 单选框控件数组
             */
            getItems: function () {
                var inputEl = this.getInput(),
                    result = [];

                if (!inputEl.name) {
                    return [this];
                }
                if (inputEl.form) {
                    // 必须 name 也不为空，否则 form[o] 的值在部分浏览器下将是空
                    Array.prototype.forEach.call(inputEl.form[inputEl.name], function (item) {
                        if (item.getControl) {
                            result.push(item.getControl());
                        }
                    });
                    return result;
                }
                return core.query({type: ui.Radio, custom: function (control) {
                    return !control.getInput().form && control.getName() === inputEl.name;
                }});
            },

            /**
             * 判断控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return this.getInput().checked;
            },

            /**
             * 设置单选框控件选中状态。
             * 将控件设置成为选中状态，会取消同一个单选框控件组的其它控件的选中状态。
             * @public
             *
             * @param {boolean} checked 是否选中
             */
            setChecked: function (checked) {
                if (this.isChecked() !== checked) {
                    if (checked) {
                        this.getItems().forEach(function (item) {
                            flush.call(item, item === this);
                        }, this);
                    } else {
                        flush.call(this, false);
                    }
                }
            }
        }
    );
}());

/*
Select - 定义模拟下拉框行为的基本操作。
下拉框控件，继承自输入控件，实现了选项组接口，扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有焦点，就可以通过滚轮上下选择选项。

下拉框控件直接HTML初始化的例子:
<select ui="type:select" name="sex">
  <option value="male" selected="selected">男</option>
  <option value="female">女</option>
</select>
或
<div ui="type:select;name:sex;value:male">
  <label ui="value:male">男</label>
  <label ui="value:female">女</label>
</div>

属性
_nOptionSize  - 下接选择框可以用于选择的条目数量
_cSelected    - 当前选中的选项
_uText        - 下拉框的文本框
_uOptions     - 下拉选择框
*/
(function () {

    /**
     * 下拉框刷新。
     * @private
     */
    function flush() {
        var el = this._uOptions.getOuter(),
            pos = dom.getPosition(this.getOuter()),
            optionTop = pos.top + this.getHeight();

        if (!dom.getParent(el)) {
            // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
            document.body.appendChild(el);
            this.cache(false, true);
            this.$alterItems();
        }

        if (this._uOptions.isShow()) {
            if (this._cSelected) {
                core.setFocused(this._cSelected);
            }
            this._uOptions.getBody().scrollTop = this.getBodyHeight() * this.getItems().indexOf(this._cSelected);

            // 以下使用el代替optionHeight
            el = this._uOptions.getHeight();

            // 如果浏览器下部高度不够，将显示在控件的上部
            this._uOptions.setPosition(pos.left, optionTop + el <= util.getView().bottom ? optionTop : pos.top - el);
        }
    }

    /**
     * 改变下拉框当前选中的项。
     * @private
     *
     * @param {ecui.ui.Select.Item} item 新选中的项
     */
    function setSelected(item) {
        item = item || null;
        if (item !== this._cSelected) {
            this._uText.setContent(item ? item.getBody().innerHTML : '');
            ui.InputControl.prototype.setValue.call(this, item ? item._sValue : '');
            this._cSelected = item;
            if (this._uOptions.isShow()) {
                core.setFocused(item);
            }
        }
    }

    /**
     * 初始化下拉框控件。
     * options 对象支持的属性如下：
     * optionSize     下拉框最大允许显示的选项数量，默认为5
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Select = core.inherits(
        ui.InputControl,
        'ui-select',
        function (el, options) {
            var optionsEl = dom.create(options.classes.join('-options '));

            util.setDefault(options, 'hidden', true);

            if (el.tagName === 'SELECT') {
                var o = el;

                options.name = el.name;
                options.value = el.value;

                // 移除select标签
                el = dom.insertBefore(dom.create(el.className), el);
                dom.remove(o);

                // 转化select标签
                optionsEl.innerHTML = Array.prototype.map.call(el.options, function (item) {
                    return '<label ' + core.getAttributeName() + '="value:' + util.encodeHTML(item.value) + '">' + util.encodeHTML(item.text) + '</label>';
                }).join('');
            } else {
                dom.childMoves(el, optionsEl);
            }

            el.innerHTML = '<label class="' + options.classes.join('-text ') + '"></label>';

            ui.InputControl.constructor.call(this, el, options);

            this._uText = core.$fastCreate(ui.Item, el.firstChild, this, {capturable: false});
            this._uOptions = core.$fastCreate(this.Options, optionsEl, this, {resizable: true});

            this.$setBody(optionsEl);
            // 初始化下拉区域最多显示的选项数量
            this._nOptionSize = options.optionSize || 10;

            this.$initItems();
        },
        ui.Items,
        {
            /**
             * 初始化下拉框控件的选项部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Item: core.inherits(
                ui.Item,
                '',
                function (el, options) {
                    ui.Item.constructor.call(this, el, options);
                    this._sValue = options.value === undefined ? dom.getText(el) : String(options.value);
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Item.prototype.$click.call(this, event);
                        var select = this.getParent();
                        select._uOptions.hide();
                        setSelected.call(select, this);
                        core.triggerEvent(select, 'change');
                    },

                    /**
                     * 对于下拉框选项，鼠标移入即自动获得焦点。
                     * @override
                     */
                    $mouseover: function (event) {
                        ui.Item.prototype.$mouseover.call(this, event);
                        core.setFocused(this);
                    },

                    /**
                     * 获取选项的值。
                     * getValue 方法返回选项控件的值，即选项选中时整个下拉框控件的值。
                     * @public
                     *
                     * @return {string} 选项的值
                     */
                    getValue: function () {
                        return this._sValue;
                    },

                    /**
                     * 设置选项的值。
                     * setValue 方法设置选项控件的值，即选项选中时整个下拉框控件的值。
                     * @public
                     *
                     * @param {string} value 选项的值
                     */
                    setValue: function (value) {
                        var parent = this.getParent();
                        this._sValue = value;
                        if (parent && this === parent._cSelected) {
                            // 当前被选中项的值发生变更需要同步更新控件的值
                            ui.InputControl.prototype.setValue.call(parent, value);
                        }
                    }
                }
            ),

            /**
             * 初始化下拉框控件的下拉选项框部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Options: core.inherits(
                ui.Control
            ),

            /**
             * 选项控件发生变化的处理。
             * 在 选项组接口 中，选项控件发生添加/移除操作时调用此方法。虚方法，子控件必须实现。
             * @protected
             */
            $alterItems: function () {
                var step = this.getBodyHeight(),
                    width = this.getWidth(),
                    itemLength = this.getItems().length;

                if (dom.getParent(this._uOptions.getOuter())) {
                    // 为了设置激活状态样式, 因此必须控制下拉框中的选项必须在滚动条以内
                    this.setItemSize(width - this._uOptions.getMinimumWidth() - (itemLength > this._nOptionSize ? core.getScrollNarrow() : 0), step);

                    // 设置options框的大小，如果没有元素，至少有一个单位的高度
                    this._uOptions.$setSize(width, (Math.min(itemLength, this._nOptionSize) || 1) * step + this._uOptions.getMinimumHeight());
                }
            },

            /**
             * 下拉框控件失去激活时，如果鼠标在选项上，触发click事件。
             * @override
             */
            $blur: function (event) {
                ui.InputControl.prototype.$blur.call(this, event);
                this._uOptions.hide();
            },

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                (dom.getParent(this._uOptions.getOuter()) ? ui.Items : ui.InputControl.prototype).$cache.call(this, style, cacheSize);
                this._uText.cache(false, true);
                this._uOptions.cache(false, true);
            },

            /**
             * @override
             */
            $click: function (event) {
                ui.InputControl.prototype.$click.call(this, event);
                if (event.getControl() === this) {
                    if (this._uOptions.isShow()) {
                        this._uOptions.hide();
                    } else {
                        flush.call(this);
                        this._uOptions.show();
                    }
                }
            },

            /**
             * 控件在下拉框展开时，需要拦截浏览器的点击事件，如果点击在下拉选项区域，则选中当前项，否则直接隐藏下拉选项框。
             * @override
             */
            $intercept: function (event) {
                for (var control = event.getControl(); control; control = control.getParent()) {
                    // 检查点击是否在当前下拉框的选项上
                    if (control instanceof this.Item) {
                        event.preventDefault();
                        return;
                    }
                }
                this._uOptions.hide();
                event.exit();
            },

            /**
             * 接管对上下键与回车/ESC键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keydown: function (event) {
                ui.InputControl.prototype.$keydown.call(this, event);

                if (event.which === 13 || event.which === 27 || event.which === 38 || event.which === 40) {
                    event.exit();
                }
            },

            /**
             * 接管对上下键与回车/ESC键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keypress: function (event) {
                ui.InputControl.prototype.$keypress.call(this, event);

                if (event.which === 13 || event.which === 27 || event.which === 38 || event.which === 40) {
                    event.exit();
                }
            },

            /**
             * 接管对上下键与回车/ESC键的处理。
             * @protected
             *
             * @param {ecui.ui.Event} event 键盘事件
             */
            $keyup: function (event) {
                ui.InputControl.prototype.$keyup.call(this, event);

                var which = event.which,
                    list = this.getItems(),
                    step = this.getBodyHeight(),
                    focus = core.getFocused();

                if (which === core.getKey()) {
                    if (this.isFocused()) {
                        // 当前不能存在鼠标操作，否则屏蔽按键
                        if (which === 40 || which === 38) {
                            if (list.length) {
                                if (this._uOptions.isShow()) {
                                    core.setFocused(list[which = Math.min(Math.max(0, list.indexOf(focus) + which - 39), list.length - 1)]);
                                    which -= this.getBody().scrollTop / step;
                                    this.getBody().scrollTop += (which < 0 ? which : which >= this._nOptionSize ? which - this._nOptionSize + 1 : 0) * step;
                                } else {
                                    var oldIndex = list.indexOf(this._cSelected),
                                        index = Math.min(Math.max(0, oldIndex + which - 39), list.length - 1);
                                    if (oldIndex !== index) {
                                        this.setSelectedIndex(index);
                                        core.triggerEvent(this, 'change');
                                    }
                                }
                            }
                            event.exit();
                        } else if (which === 27 || (which === 13 && this._uOptions.isShow())) {
                            // 回车键选中，ESC键取消
                            if (which === 13) {
                                if (this._cSelected !== focus) {
                                    setSelected.call(this, focus);
                                    core.triggerEvent(this, 'change');
                                }
                            }
                            this._uOptions.hide();
                            event.exit();
                        }
                    }
                }
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.InputControl.prototype.$ready.call(this, options);
                this.setValue(this.getValue());
            },

            /**
             * 下拉框移除子选项时，如果选项被选中，需要先取消选中。
             * @override
             */
            $remove: function (item) {
                if (item === this._cSelected) {
                    setSelected.call(this);
                }
                ui.Items.$remove.call(this, item);
            },

            /**
             * @override
             */
            $setSize: function (width, height) {
                ui.InputControl.prototype.$setSize.call(this, width, height);
                // 设置文本区域
                this._uText.$setSize(this.getBodyWidth(), this.getBodyHeight());
            },

            /**
             * 获取被选中的选项控件。
             * @public
             *
             * @return {ecui.ui.Item} 选项控件
             */
            getSelected: function () {
                return this._cSelected || null;
            },

            /**
             * 设置下拉框允许显示的选项数量。
             * 如果实际选项数量小于这个数量，没有影响，否则将出现垂直滚动条，通过滚动条控制其它选项的显示。
             * @public
             *
             * @param {number} value 显示的选项数量，必须大于 1
             */
            setOptionSize: function (value) {
                this._nOptionSize = value;
                this.$alterItems();
                flush.call(this);
            },

            /**
             * 根据序号选中选项。
             * @public
             *
             * @param {number} index 选项的序号
             */
            setSelectedIndex: function (index) {
                setSelected.call(this, this.getItems()[index]);
            },

            /**
             * 设置控件的值。
             * setValue 方法设置控件的值，设置的值必须与一个子选项的值相等，否则将被设置为空，使用 getValue 方法获取设置的值。
             * @public
             *
             * @param {string} value 需要选中的值
             */
            setValue: function (value) {
                if (this.getItems().every(function (item) {
                        if (item._sValue === value) {
                            setSelected.call(this, item);
                            return false;
                        }
                        return true;
                    }, this)) {
                    // 找不到满足条件的项，将选中的值清除
                    setSelected.call(this);
                }
            }
        }
    );
}());

/*
Combox - 定义可输入下拉框行为的基本操作。
可输入下拉框控件，继承自下拉框控件，在下拉框控件的基础上允许选项框可输入内容。

可输入下拉框控件直接HTML初始化的例子:
<select ui="type:combox" name="age">
  <option value="20">20</option>
  <option value="21" selected="selected">21</option>
  <option value="22">22</option>
</select>
或
<div ui="type:combox;name:age;value:21">
  <div ecui="value:20">20</div>
  <div ecui="value:21">21</div>
  <div ecui="value:22">22</div>
</div>

如果需要自定义特殊的选项效果，请按下列方法初始化:
<div ui="type:combox">
    <!-- 如果ec中不指定name，也可以在input中指定 -->
    <input name="test" />
    <!-- 这里放选项内容 -->
    <li value="值">文本</li>
    ...
</div>
*/
(function () {

    /**
     * 初始化可输入下拉框控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Combox = core.inherits(
        ui.Select,
        '*ui-combox',
        function (el, options) {
            util.setDefault(options, 'hidden', false);
            ui.Select.constructor.call(this, el, options);
        },
        {
            /**
             * 设置控件的大小。
             * @protected
             *
             * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
             * @param {number} height 高度，如果不需要设置则省略此参数
             */
            $setSize: function (width, height) {
                ui.Select.prototype.$setSize.call(this, width, height);
                this.getInput().style.width = this.$getSection('Text').getWidth() + 'px';
            }
        }
    );
}());


/*
Dialog - 定义独立于文档布局的内容区域的基本操作。
窗体控件，继承自基础控件，仿真浏览器的多窗体效果，如果在其中包含 iframe 标签，可以在当前页面打开一个新的页面，避免了使用 window.open 在不同浏览器下的兼容性问题。多个窗体控件同时工作时，当前激活的窗体在最上层。窗体控件的标题栏默认可以拖拽，窗体可以设置置顶方式显示，在置顶模式下，只有当前窗体可以响应操作。窗体控件的 z-index 从4096开始，页面开发请不要使用大于或等于4096的 z-index 值。

窗体控件直接HTML初始化的例子:
<div ui="type:dialog">
  <label>窗体的标题</label>
  <!-- 这里放窗体的内容 -->
  ...
</div>

属性
_bModal      - 是否使用showModal激活
_uTitle     - 标题栏
_uClose     - 关闭按钮
*/
(function () {

    var dialogs = [],    // 当前显示的全部窗体
        modalCount = 0;  // 当前showModal的窗体数

    /**
     * 刷新所有显示的窗体的zIndex属性。
     * @protected
     */
    function flush() {
        util.remove(dialogs, this);
        dialogs.push(this);

        // 改变当前窗体之后的全部窗体z轴位置，将当前窗体置顶
        var num = dialogs.length - modalCount;
        dialogs.forEach(function (item, index) {
            item.getOuter().style.zIndex = index >= num ? 32769 + (index - num) * 2 : 4095 + index;
        });
    }

    /**
     * 初始化窗体控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Dialog = core.inherits(
        ui.Control,
        'ui-dialog',
        function (el, options) {
            // 生成标题控件与内容区域控件对应的Element对象
            var bodyEl = dom.create(options.classes.join('-body ')),
                closeEl = dom.create(options.classes.join('-close ')),
                titleEl = dom.first(el);

            dom.childMoves(el, bodyEl, true);

            el.appendChild(closeEl);
            if (!titleEl || titleEl.tagName !== 'LABEL') {
                titleEl = dom.create('', 'LABEL');
            }
            titleEl.className += options.classes.join('-title ');
            el.appendChild(titleEl);
            el.appendChild(bodyEl);

            ui.Control.constructor.call(this, el, options);

            this._uClose = core.$fastCreate(this.Close, closeEl, this);
            this._uTitle = core.$fastCreate(this.Title, titleEl, this, {userSelect: false});
            this.$setBody(bodyEl);
        },
        {
            /**
             * 初始化窗体控件的关闭按钮部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Close: core.inherits(
                ui.Button,
                '',
                {
                    /**
                     * 窗体关闭按钮点击关闭窗体。
                     * @override
                     */
                    $click: function (event) {
                        ui.Control.prototype.$click.call(this, event);
                        this.getParent().hide();
                    }
                }
            ),

            /**
             * 初始化窗体控件的标题栏部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Title: core.inherits(
                ui.Control,
                '',
                {
                    /**
                     * 标题栏激活时触发拖动，如果当前窗体未得到焦点则得到焦点。
                     * @override
                     */
                    $activate: function (event) {
                        ui.Control.prototype.$activate.call(this, event);
                        core.drag(this.getParent(), event);
                    }
                }
            ),

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.Control.prototype.$cache.call(this, style, cacheSize);

                this._uClose.cache(true, true);
                this._uTitle.cache(true, true);
            },

            /**
             * 销毁窗体时需要先关闭窗体，并不再保留窗体的索引。
             * @override
             */
            $dispose: function () {
                if (dialogs.indexOf(this) >= 0) {
                    // 窗口处于显示状态，需要强制关闭
                    this.$hide();
                }
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 窗体控件获得焦点时需要将自己置于所有窗体控件的顶部。
             * @override
             */
            $focus: function () {
                ui.Control.prototype.$focus.call(this);
                flush.call(this);
            },

            /**
             * 窗体隐藏时将失去焦点状态，如果窗体是以 showModal 方式打开的，隐藏窗体时，需要恢复页面的状态。
             * @override
             */
            $hide: function () {
                // showModal模式下隐藏窗体需要释放遮罩层
                var i = dialogs.indexOf(this);
                if (i >= 0) {
                    dialogs.splice(i, 1);

                    if (i > dialogs.length - modalCount) {
                        if (this._bModal) {
                            if (i === dialogs.length) {
                                core.mask();
                            } else {
                                // 如果不是最后一个，将遮罩层标记后移
                                dialogs[i]._bModal = true;
                            }
                            this._bModal = false;
                        }
                        modalCount--;
                    }
                    core.loseFocus(this);
                }

                ui.Control.prototype.$hide.call(this);
            },

            /**
             * 窗体显示时将获得焦点状态。
             * @override
             */
            $show: function () {
                dialogs.push(this);
                ui.Control.prototype.$show.call(this);
                core.setFocused(this);
            },

            /**
             * 如果窗体是以 showModal 方式打开的，只有位于最顶层的窗体才允许关闭。
             * @override
             */
            hide: function () {
                for (var i = dialogs.indexOf(this), o; o = dialogs[++i]; ) {
                    if (o._bModal) {
                        return false;
                    }
                }
                return ui.Control.prototype.hide.call(this);
            },

            /**
             * @override
             */
            init: function () {
                ui.Control.prototype.init.call(this);
                this._uTitle.init();
                this._uClose.init();
            },

            /**
             * showModal时如果窗体不置顶都设置为不可用。
             * @override
             */
            isDisabled: function () {
                if (modalCount > 0) {
                    return dialogs[dialogs.length - 1] !== this;
                }
                return ui.Control.prototype.isDisabled.call(this);
            },

            /**
             * 设置窗体控件标题。
             * @public
             *
             * @param {string} text 窗体标题
             */
            setTitle: function (text) {
                this._uTitle.setContent(text || '');
            },

            /**
             * @override
             */
            show: function () {
                if (modalCount && dialogs.indexOf(this) < dialogs.length - modalCount) {
                    // 如果已经使用showModal，对原来不是showModal的窗体进行处理
                    modalCount++;
                }

                var result = ui.Control.prototype.show.call(this);
                if (!result) {
                    flush.call(this);
                }
                return result;
            },

            /**
             * 窗体以独占方式显示
             * showModal 方法将窗体控件以独占方式显示，此时鼠标点击窗体以外的内容无效，关闭窗体后自动恢复。
             * @public
             *
             * @param {number} opacity 遮罩层透明度，默认为0.5
             */
            showModal: function (opacity) {
                if (!this._bModal) {
                    if (dialogs.indexOf(this) < dialogs.length - modalCount) {
                        modalCount++;
                    }

                    core.mask(opacity !== undefined ? opacity : 0.5, 32766 + modalCount * 2);

                    this._bModal = true;
                    if (!ui.Control.prototype.show.call(this)) {
                        flush.call(this);
                    }
                    this.center();
                }
            }
        }
    );
}());

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
            
            if (!options.hasOwnProperty('rootNode')) {
                options.rootNode = this;
            }

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
                        core.triggerEvent(control, 'nodeover', event);
                    } else {
                        control = null;
                    }
                    core.triggerEvent(hovered, 'nodeout', event);
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
                    core.triggerEvent(hovered, 'nodeout', event);
                }
                core.triggerEvent(this, 'nodeover', event);
                hovered = this;
            },

            /**
             * 节点移出事件的默认处理。
             * 鼠标移出节点区域时，控件解除悬停状态，移除状态样式 -nodehover。与 mouseout 不同的是， nodeout 没有与父结点关联。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $nodeout: function () {
                this.alterClass('-nodehover');
            },

            /**
             * 节点移入事件的默认处理。
             * 鼠标移入节点区域时，控件获得悬停状态，添加状态样式 -nodehover。与 mouseover 不同的是， nodeover 没有与父结点关联。
             * @protected
             *
             * @param {ecui.ui.Event} event 事件对象
             */
            $nodeover: function () {
                this.alterClass('+nodehover');
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

/*
MonthView - 定义日历显示的基本操作。
日历视图控件，继承自基础控件，不包含年/月/日的快速选择与切换，如果需要实现这些功能，请将下拉框(选择月份)、输入框(输入年份)等组合使用建立新的控件或直接在页面上布局并调用接口。

日历视图控件直接HTML初始化的例子:
<div ui="type:month-view;year:2009;month:11"></div>

属性
_bExtra     - 扩展的日期是否响应事件
_nYear      - 年份
_nMonth     - 月份(0-11)
_aCells     - 日历控件内的所有单元格，其中第0-6项是日历的头部星期名称
_oBegin     - 开始日期
_oEnd       - 结束日期
_oDate      - 当前选择日期
_cSelected  - 当前选择的日历单元格

子控件属性
_nDay       - 从本月1号开始计算的天数，如果是上个月，是负数，如果是下个月，会大于当月最大的天数
*/
(function () {

    /**
     * 获取匹配的日期。
     * @private
     *
     * @param {Date} date 原始日期对象
     * @param {number} year 匹配的年份
     * @param {number} month 匹配的月份
     * @param {number} day 当年月无法匹配时的返回值
     * @return {number} 年月可以匹配时返回日期
     */
    function getDay(date, year, month, day) {
        return date && date.getFullYear() === year && date.getMonth() === month ? date.getDate() : day;
    }

    /**
     * 选中某个日期单元格。
     * @private
     *
     * @param {ecui.ui.MonthView.Cell} cell 日期单元格对象
     */
    function setSelected(cell) {
        if (this._cSelected !== cell) {
            if (this._cSelected) {
                this._cSelected.alterClass('-selected');
            }

            if (cell) {
                cell.alterClass('+selected');
            }
            this._cSelected = cell;
        }
    }

    /**
     * 初始化日历控件。
     * options 对象支持的属性如下：
     * year    日历控件的年份
     * month   日历控件的月份(1-12)
     * begin   开始日期，小于这个日期的日历单元格会被disabled
     * end     结束日期，大于这个日期的日历单元格会被disabled
     * date    初始选中的日期，默认是今日
     * extra   扩展的日期是否响应事件，默认为disable，如果需要响应事件设置成enable
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.MonthView = core.inherits(
        ui.Control,
        'ui-monthview',
        function (el, options) {
            ui.Control.constructor.call(this, el, options);

            el.innerHTML = util.stringFormat(
                '<table><thead>{1}</thead><tbody>{0}{0}{0}{0}{0}{0}</tbody></table>',
                util.stringFormat(
                    '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                    util.stringFormat('<td class="{0}"></td>', options.classes.join('-date '))
                ),
                util.stringFormat(
                    '<tr>{0}{0}{0}{0}{0}{0}{0}</tr>',
                    util.stringFormat('<td class="{0}"></td>', options.classes.join('-title '))
                )
            );

            this._aCells = Array.prototype.map.call(el.getElementsByTagName('TD'), function (item) {
                return core.$fastCreate(this.Cell, item, this);
            }, this);

            this.WEEKNAMES.forEach(function (item, index) {
                this._aCells[index].setContent(item);
            }, this);

            this._bExtra = options.extra !== 'enable';
            this._oBegin = new Date(options.begin);
            this._oEnd = new Date(options.end);
            this._oDate = options.date ? new Date(options.date) : new Date();
        },
        {
            WEEKNAMES: ['一', '二', '三', '四', '五', '六', '日'],

            /**
             * 初始化日历控件的单元格部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Cell: core.inherits(
                ui.Control,
                '',
                {
                    /**
                     * 点击时，根据单元格类型触发相应的事件。
                     * @override
                     */
                    $click: function (event) {
                        var parent = this.getParent(),
                            index = parent._aCells.indexOf(this);

                        if (index < 7) {
                            core.triggerEvent(parent, 'titleclick', event, index);
                        } else if (core.triggerEvent(parent, 'dateclick', event, index = new Date(parent._nYear, parent._nMonth, this._nDay))) {
                            parent._oDate = index;
                            setSelected.call(parent, this);
                        }
                    },

                    /**
                     * 获取单元格天的信息。
                     * @public
                     *
                     * @return {number} 一个月中的第几天
                     */
                    getDay: function () {
                        return this._nDay;
                    }
                }
            ),

            /**
             * @override
             */
            $ready: function (options) {
                ui.Control.prototype.$ready.call(this, options);
                this.setView(this.getYear(), this.getMonth());
            },

            /**
             * 获取全部的日期对象。
             * @public
             *
             * @return {Array} 日期对象列表
             */
            getDays: function () {
                return this._aCells.slice(7);
            },

            /**
             * 获取当前选择的日期。
             * @public
             *
             * @return {Date} 日期对象
             */
            getDate: function () {
                return this._oDate;
            },

            /**
             * 获取日历控件当前显示的月份。
             * @public
             *
             * @return {number} 月份(1-12)
             */
            getMonth: function () {
                return this._nMonth + 1;
            },

            /**
             * 获取日历控件当前显示的年份。
             * @public
             *
             * @return {number} 年份(19xx-20xx)
             */
            getYear: function () {
                return this._nYear;
            },

            /**
             * 日历显示移动指定的月份数。
             * 参数为正整数则表示向当前月份之后的月份移动，负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
             * @public
             *
             * @param {number} offsetMonth 日历移动的月份数
             */
            move: function (offsetMonth) {
                var time = new Date(this._nYear, this._nMonth + offsetMonth, 1);
                this.setView(time.getFullYear(), time.getMonth() + 1);
            },

            /**
             * 设置当前选择的日期，并切换到对应的月份。
             * @public
             *
             * @param {Date} date 日期
             */
            setDate: function (date) {
                this._oDate = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : null;
                this.setView(date.getFullYear(), date.getMonth() + 1);
            },

            /**
             * 设置日历控件的有效日期范围。
             * 不在有效日期范围的时间单无格都会处于 disabled 状态。
             * @public
             *
             * @param {Date} begin 开始日期，默认表示不限制开始日期
             * @param {Date} end 结束日期，默认表示不限制结束日期
             */
            setRange: function (begin, end) {
                this._oBegin = begin;
                this._oEnd = end;
                this.setView(this.getYear(), this.getMonth());
            },

            /**
             * 设置日历控件当前显示的月份。
             * @public
             *
             * @param {number} year 年份(19xx-20xx)，如果省略使用浏览器的当前年份
             * @param {number} month 月份(1-12)，如果省略使用浏览器的当前月份
             */
            setView: function (year, month) {
                var today = new Date(),
                    dateYear = year || today.getFullYear(),
                    dateMonth = month ? month - 1 : today.getMonth(),
                    // 得到上个月的最后几天的信息，用于补齐当前月日历的上月信息位置
                    o = new Date(dateYear, dateMonth, 0),
                    day = 1 - o.getDay(),
                    lastDayOfLastMonth = o.getDate(),
                    // 得到当前月的天数
                    lastDayOfCurrMonth = new Date(dateYear, dateMonth + 1, 0).getDate(),
                    begin = getDay(this._oBegin, dateYear, dateMonth, 1),
                    end = getDay(this._oEnd, dateYear, dateMonth, lastDayOfCurrMonth),
                    selected = getDay(this._oDate, dateYear, dateMonth, 0),
                    now = getDay(today, dateYear, dateMonth, 0),
                    type = this.getType();

                this._nYear = dateYear;
                this._nMonth = dateMonth;

                setSelected.call(this);

                this._aCells.forEach(function (item, index) {
                    if (index > 6) {
                        var el = item.getOuter();
                        if (month = day >= begin && day <= end) {
                            if (index === 35 || index === 42) {
                                dom.removeClass(dom.getParent(el), type + '-extra');
                            }
                            dom.removeClass(el, type + '-extra');
                            // 恢复选择的日期
                            if (day === selected) {
                                setSelected.call(this, item);
                            }
                            item.enable();
                        } else {
                            if (index === 35 || index === 42) {
                                dom.addClass(dom.getParent(el), type + '-extra');
                            }
                            dom.addClass(el, type + '-extra');
                            if (this._bExtra) {
                                item.disable();
                            }
                        }

                        if (day === now && now > 0) {
                            dom.addClass(el, type + '-today');
                        } else {
                            dom.removeClass(el, type + '-today');
                        }

                        item.setContent(month ? day : day > lastDayOfCurrMonth ? day - lastDayOfCurrMonth : lastDayOfLastMonth + day);
                        item._nDay = day++;
                    }
                }, this);
            }
        }
    );
}());

/*
Tab - 定义分页选项卡的操作。
选项卡控件，继承自基础控件，实现了选项组接口。每一个选项卡都包含一个头部区域与容器区域，选项卡控件存在互斥性，只有唯一的一个选项卡能被选中并显示容器区域。

直接初始化选项卡控件的例子
<div ui="type:tab;selected:1">
    <!-- 包含容器的选项卡 -->
    <div>
        <label>标题1</label>
        <!-- 这里是容器 -->
        ...
    </div>
    <!-- 仅有标题的选项卡，以下selected定义与控件定义是一致的，可以忽略其中之一 -->
    <label ui="selected:true">标题2</label>
</div>

属性
_cSelected       - 当前选中的选项卡

Item属性
_eContainer      - 容器 DOM 元素
*/
(function () {

    /**
     * 移除容器 DOM 元素。
     * @private
     */
    function removeContainer() {
        if (this._eContainer) {
            var parent = this.getParent();
            if (parent) {
                if (parent.getItems().every(function (item) {
                        return item === this || item._eContainer !== this._eContainer;
                    }, this)) {
                    dom.remove(this._eContainer);
                }
            }
        }
    }

    /**
     * 初始化选项卡控件。
     * options 对象支持的特定属性如下：
     * selected 选中的选项序号，默认为0
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Tab = core.inherits(
        ui.Control,
        'ui-tab',
        function (el, options) {
            ui.Control.constructor.call(this, el, options);

            var titleEl = dom.create(options.classes.join('-title '));
            dom.childMoves(el, titleEl);
            el.appendChild(titleEl);

            this.$setBody(titleEl);
            this.$initItems();
        },
        ui.Items,
        {
            /**
             * 初始化选项卡控件的选项部件。
             * options 对象支持的特定属性如下：
             * container 容器的id，如果通过这里设置，不允许改变关联容器
             * selected 当前项是否被选中
             * @protected
             *
             * @param {Object} options 初始化选项
             */
            Item: core.inherits(
                ui.Item,
                '',
                function (el, options) {
                    if (el.tagName !== 'LABEL') {
                        var containerEl = el;
                        el = dom.first(el);
                        el.className = containerEl.className;
                        containerEl.className = '';
                    }

                    ui.Item.constructor.call(this, el, options);

                    if (containerEl) {
                        if (options.parent) {
                            options.parent.getBody().insertBefore(el, containerEl);
                        } else {
                            containerEl.removeChild(el);
                        }
                        this._eContainer = containerEl;
                    }

                    if (options.container) {
                        this._eContainer = core.$(options.container);
                    }

                    if (this._eContainer && !options.selected) {
                        dom.addClass(this._eContainer, 'ui-hide');
                        this.getMain().appendChild(this._eContainer);
                    }

                    if (parent && options.selected) {
                        options.parent.setSelected(this);
                    }
                },
                {
                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._eContainer = null;
                        ui.Item.prototype.$dispose.call(this);
                    },

                    /**
                     * @override
                     */
                    $setParent: function (parent) {
                        if (!parent) {
                            removeContainer.call(this);
                        } else if (this._eContainer && dom.getParent(this._eContainer) !== parent.getMain()) {
                            parent.getMain().appendChild(this._eContainer);
                        }

                        ui.Item.prototype.$setParent.call(this, parent);
                    },

                    /**
                     * 获取选项卡对应的容器元素。
                     * @public
                     *
                     * @return {HTMLElement} 选项卡对应的容器元素
                     */
                    getContainer: function () {
                        return this._eContainer;
                    },

                    /**
                     * 设置选项卡对应的容器元素。
                     * @public
                     *
                     * @param {HTMLElement} el 选项卡对应的容器元素
                     */
                    setContainer: function (el) {
                        var parent = this.getParent();

                        removeContainer.call(this);
                        if (this._eContainer = el) {
                            parent.getMain().appendChild(el);
                            // 如果当前节点被选中需要显示容器元素，否则隐藏
                            if (parent._cSelected === this) {
                                dom.removeClass(el, 'ui-hide');
                            } else {
                                dom.addClass(el, 'ui-hide');
                            }
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $alterItems: util.blank,

            /**
             * @override
             */
            $itemclick: function (event, target) {
                this.setSelected(target);
                core.triggerEvent(this, 'change');
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.Control.prototype.$ready.call(this, options);

                if (!this._cSelected) {
                    this.setSelected(+(options.selected || 0));
                }
            },

            /**
             * @override
             */
            $remove: function (child) {
                if (this._cSelected === child) {
                    var list = this.getItems(),
                        index = list.indexOf(child);

                    // 跳到被删除项的后一项
                    this.setSelected(index === list.length - 1 ? index - 1 : index + 1);
                }

                ui.Items.$remove.call(this, child);
            },

            /**
             * 获得当前选中的选项卡控件。
             *
             * @return {ecui.ui.Tab.Item} 选中的选项卡控件
             */
            getSelected: function () {
                return this._cSelected;
            },

            /**
             * 设置被选中的选项卡。
             * @public
             *
             * @param {number|ecui.ui.Tab.Item} 选项卡子选项的索引/选项卡子选项控件
             */
            setSelected: function (item) {
                if ('number' === typeof item) {
                    item = this.getItems()[item];
                }

                if (this._cSelected !== item) {
                    if (this._cSelected) {
                        this._cSelected.alterClass('-selected');
                        if (this._cSelected._eContainer && (!item || this._cSelected._eContainer !== item._eContainer)) {
                            dom.addClass(this._cSelected._eContainer, 'ui-hide');
                        }
                    }

                    if (item) {
                        item.alterClass('+selected');
                        if (item._eContainer && (!this._cSelected || this._cSelected._eContainer !== item._eContainer)) {
                            dom.removeClass(item._eContainer, 'ui-hide');
                        }
                    }

                    this._cSelected = item;
                }
            }
        }
    );
}());

/*
Progress - 定义进度显示的基本操作。
进度条控件，继承自基础控件，面向用户显示一个任务执行的程度。

进度条控件直接HTML初始化的例子:
<div ui="type:progress;rate:0.5"></div>

属性
_eText - 内容区域
_eMask - 完成的进度比例内容区域
*/

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


(function () {

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

/*
MessageBox - 消息框功能。
*/
(function () {

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

/*
Decorate - 装饰器插件。
*/
(function () {

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

(function () {

    var routes = {},
        autoRender = {},
        context,
        currLocation = '',
        pauseStatus;

    /**
     * 增加IE的history信息。
     * @private
     *
     * @param {string} loc 当前地址
     * @return 如果增加了history信息返回true，否则不返回
     */
    function addIEHistory(loc) {
        if (ieVersion < 8) {
            var iframeDoc = document.getElementById('ECUI_LOCATOR').contentWindow.document;
            iframeDoc.open('text/html');
            iframeDoc.write(
                '<html><body><script type="text/javascript">' +
                    'var loc="' + loc.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"') + '";' +
                    'parent.ecui.esr.setLocation(loc);' +
                    'parent.ecui.esr.callRoute(loc);' +
                    '</script></body></html>'
            );
            iframeDoc.close();
            return true;
        }
    }

    /**
     * 调用指定的路由。
     * @private
     *
     * @param {string} name 路由名称
     * @param {Object} options 参数
     */
    function callRoute(name, options) {
        // 供onready时使用，此时name为route
        var route = options ? routes[name] : name;
        if (route) {
            if (!route.onrender || route.onrender() !== false) {
                if (options !== true) {
                    context = {};
                }

                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        context[key] = options[key];
                    }
                }

                if (!route.model) {
                    core.esr.render(name, route);
                } else if ('function' === typeof route.model) {
                    if (route.model(context, function () {
                            core.esr.render(name, route);
                        }) !== false) {
                        core.esr.render(name, route);
                    }
                } else {
                    core.esr.request.call(route, route.model, function () {
                        core.esr.render(name, route);
                    });
                }
            }
        } else {
            pauseStatus = true;
            io.loadScript(
                name + '/' + name + '.js',
                function () {
                    pauseStatus = false;
                    if (core.esr.getRoute(name)) {
                        callRoute(name, options);
                    //} else {
                    //    低版本IE失败
                    }
                },
                {
                    onerror: function () {
                        // 其他浏览器失败
                        pauseStatus = false;
                    }
                }
            );
        }
    }

    /**
     * 事件监听处理函数。
     * @private
     */
    function listener() {
        if (!pauseStatus) {
            core.esr.redirect(core.esr.getLocation());
        }
    }

    /**
     * 初始化。
     * @private
     */
    function init() {
        if (ieVersion < 8) {
            var iframe = document.createElement('iframe');

            iframe.id = 'ECUI_LOCATOR';
            iframe.src = 'about:blank';

            document.body.appendChild(iframe);
            setInterval(listener, 100);
        } else if (window.onhashchange === null) {
            window.onhashchange = listener;
            listener();
        } else {
            setInterval(listener, 100);
        }
    }

    /**
     * 解析地址。
     * @private
     *
     * @param {string} loc 地址
     * @return {Object} 地址信息，其中''的值表示路由名称
     */
    function parseLocation(loc) {
        var list = loc.split('~'),
            options = {'': list[0]};

        list.forEach(function (item, index) {
            if (index && item) {
                var data = item.split('=');
                if (data.length === 1) {
                    options[data[0]] = true;
                } else {
                    options[data[0]] = data[1] ? decodeURIComponent(data[1]) : '';
                }
            }
        });

        return options;
    }

    /**
     * 渲染。
     * @private
     *
     * @param {string} name 路由名称
     * @param {Object} route 路由对象
     */
    function render(name, route) {
        if (route.onbeforerender) {
            route.onbeforerender(context);
        }

        var el = document.getElementById(route.main || core.esr.DEFAULT_MAIN);
        el.style.visibility = 'hidden';

        /*Array.prototype.forEach.call(el.all || el.getElementsByTagName('*'), function (item) {/
            if (item.route && item.route.ondispose) {
                item.route.ondispose();
            }
        });*/
        var items = el.all || el.getElementsByTagName('*');
        var i, item;
        for (i = 0; i < items.length; i++) {
            item = items[i];
            if (item.route && item.route.ondispose) {
                item.route.ondispose();
            }
        }
        if (el.route && el.route.ondispose) {
            el.route.ondispose();
        }

        core.dispose(el);
        el.innerHTML = etpl.render(route.view || name, context);
        core.init(el);

        el.style.visibility = '';
        el.route = route;

        if (route.onafterrender) {
            route.onafterrender(context);
        }

        if (name === route) {
            init();
        }
    }

    /**
     * 设置数据。
     * @private
     *
     * @param {ecui.ui.Control} control 控件对象
     * @param {Object} value 需要设置的值
     */
    function setData(control, value) {
        if (control.onbeforeset) {
            control.onbeforeset(value);
        }
        if (control.setData) {
            control.setData(value);
        } else {
            control.setContent(value);
        }
        if (control.onafterset) {
            control.onafterset(value);
        }
    }

    core.esr = {
        DEFAULT_PAGE: 'index',
        DEFAULT_MAIN: 'main',

        /**
         * 添加路由信息。
         * @public
         *
         * @param {string} name 路由名称
         * @param {Object} route 路由对象
         */
        addRoute: function (name, route) {
            routes[name] = route;
        },

        /**
         * 调用路由处理。
         * @public
         *
         * @param {string} loc 地址
         * @param {boolean} childRoute 是否为子路由，默认不是
         */
        callRoute: function (loc, childRoute) {
            loc = parseLocation(loc);
            callRoute(loc[''], childRoute ? true : loc);
        },

        /**
         * 改变地址，常用于局部刷新。
         * @public
         *
         * @param {string} name 路由名
         * @param {Object} options 需要改变的参数
         * @param {boolean} rewrite 是否回写原来的参数
         */
        change: function (name, options, rewrite) {
            options = options || {};

            var oldOptions = parseLocation(currLocation);
            if (rewrite) {
                rewrite = options[''] || oldOptions[''];
                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        if (options[key] === null) {
                            delete oldOptions[key];
                        } else {
                            oldOptions[key] = options[key];
                        }
                    }
                }
            } else {
                rewrite = options[''] || oldOptions[''];
                oldOptions = options;
            }
            var list = [];
            delete oldOptions[''];
            for (key in oldOptions) {
                if (oldOptions.hasOwnProperty(key)) {
                    list.push(key + '=' + encodeURIComponent(oldOptions[key]));
                }
            }
            list.sort().splice(0, 0, rewrite);
            core.esr.setLocation(list.join('~'));

            if (name) {
                if (!addIEHistory(currLocation)) {
                    callRoute(name, oldOptions);
                }
            }
        },

        /**
         * 获取数据。
         * @public
         *
         * @param {string} name 数据名
         * @return {Object} 数据值
         */
        getData: function (name) {
            return context[name];
        },

        /**
         * 获取当前地址。
         * @public
         *
         * @return {string} 当前地址
         */
        getLocation: function () {
            var hash;

            // firefox下location.hash会自动decode
            // 体现在：
            //   视觉上相当于decodeURI，
            //   但是读取location.hash的值相当于decodeURIComponent
            // 所以需要从location.href里取出hash值
            if (firefoxVersion) {
                if (hash = location.href.match(/#(.*)$/)) {
                    return hash[1];
                }
            } else if (hash = location.hash) {
                return hash.replace(/^#/, '');
            }
            return '';
        },

        /**
         * 获取路由信息。
         * @public
         *
         * @param {string} name 路由名
         * @return {Object} 路由信息
         */
        getRoute: function (name) {
            return routes[name];
        },

        /**
         * 控制定位器转向。
         * @public
         *
         * @param {string} loc location位置
         */
        redirect: function (loc) {
            // 增加location带起始#号的容错性
            // 可能有人直接读取location.hash，经过string处理后直接传入
            if (loc) {
                loc = loc.replace(/^#/, '');
            }

            if (!loc) {
                loc = core.esr.DEFAULT_PAGE;
            }

            // 与当前location相同时不进行route
            if (currLocation !== loc) {
                core.esr.setLocation(loc);
                // ie下使用中间iframe作为中转控制
                // 其他浏览器直接调用控制器方法
                if (!addIEHistory(loc)) {
                    core.esr.callRoute(loc);
                }
            }
        },

        /**
         * 渲染。
         * @public
         *
         * @param {string} name 路由名
         * @param {Object} route 路由对象
         */
        render: function (name, route) {
            if ('function' === typeof route.view) {
                if (route.onbeforerender) {
                    route.onbeforerender(context);
                }
                route.view(context);
                if (route.onafterrender) {
                    route.onafterrender(context);
                }
            } else if (etpl.getRenderer(route.view || name)) {
                render(name, route);
            } else {
                pauseStatus = true;
                io.ajax(name + '/' + name + '.html', {
                    onsuccess: function (data) {
                        pauseStatus = false;
                        etpl.compile(data);
                        render(name, route);
                    },
                    onerror: function () {
                        pauseStatus = false;
                    }
                });
            }
        },

        /**
         * 设置数据。
         * @public
         *
         * @param {string} name 数据名
         * @param {Object} value 数据值
         */
        setData: function (name, value) {
            context[name] = value;
            if (autoRender[name]) {
                autoRender[name].forEach(function (item) {
                    setData(item, value);
                });
            }
        },

        /**
         * 设置hash，不会进行真正的跳转。
         * @public
         *
         * @param {string} loc hash名
         */
        setLocation: function (loc) {
            if (loc) {
                loc = loc.replace(/^#/, '');
            }

            // 存储当前信息
            // opera下，相同的hash重复写入会在历史堆栈中重复记录
            // 所以需要ESR_GET_LOCATION来判断
            if (core.esr.getLocation() !== loc) {
                location.hash = loc;
            }
            currLocation = loc;
        },

        /**
         * 加载ESR框架。
         * @public
         */
        load: function () {
            if (core.esr.onready) {
                callRoute(core.esr.onready());
            } else {
                init();
            }
        },
//  {if 0}//
        /**
         * 动态加载模块，用于测试。
         * @public
         *
         * @param {string} name 模块名
         */
        loadModule: function (name) {
            document.write('<script type="text/javascript" src="' + name + '/' + name + '.js" module="' + name + '"></script>');
        },

        /**
         * 动态加载模块名，用于测试。
         * @public
         */
        loadModuleName: function () {
            var elements = document.getElementsByTagName('SCRIPT'),
                name;

            Array.prototype.some.call(elements, function (item) {
                if (name = item.getAttribute('module')) {
                    item.removeAttribute('module');
                    return true;
                }
            });

            core.esr.loadClass = function (filename) {
                document.write('<script type="text/javascript" src="' + name + '/class.' + filename + '.js"></script>');
            };
            core.esr.loadRoute = function (filename) {console.log(name);
                document.write('<script type="text/javascript" src="' + name + '/route.' + filename + '.js"></script>');
                document.write('<link rel="stylesheet/less" type="text/css" href="' + name + '/route.' + filename + '.css" />');
                core.pause();
                io.ajax(name + '/route.' + filename + '.html', {
                    onsuccess: function (data) {
                        core.resume();
                        etpl.compile(data);
                    }
                });
            };

            elements = null;
        },
//  {/if}//
        /**
         * 请求数据。
         * @public
         *
         * @param {Array} urls url列表，支持name@url的写法，表示结果数据写入name的变量中
         * @param {Function} onsuccess 全部请求成功时调用的函数
         * @param {Function} onerror 至少一个请求失败时调用的函数，会传入一个参数Array说明是哪些url失败
         */
        request: function (urls, onsuccess, onerror) {
            if ('string' === typeof urls) {
                urls = [urls];
            }

            var err = [],
                count = urls.length;

            onsuccess = onsuccess || util.blank;
            onerror = onerror || onsuccess;

            function request(url, varName) {
                io.ajax(url.replace(/\$\{([^}]+)\}/g, function (match, name) {
                    return context[name] === null ? '' : context[name];
                }), {
                    onsuccess: function (data) {
                        count--;
                        try {
                            data = JSON.parse(data);
                        } catch (e) {
                            data = undefined;
                            err.push(url);
                        }
                        if (data !== undefined) {
                            if (varName) {
                                core.esr.setData(varName, data.data);
                            } else {
                                for (var key in data) {
                                    if (data.hasOwnProperty(key)) {
                                        core.esr.setData(key, data.data[key]);
                                    }
                                }
                            }
                        }
                        if (!count) {
                            pauseStatus = false;
                            if (err.length) {
                                onerror(err);
                            } else {
                                onsuccess();
                            }
                        }
                    },
                    onerror: function () {
                        count--;
                        if (!count) {
                            pauseStatus = false;
                            err.push(url);
                            onerror(err);
                        }
                    }
                });
            }

            pauseStatus = true;
            if (this.onbeforerequest) {
                this.onbeforerequest(context);
            }
            urls.forEach(function (item) {
                var url = item.split('@');
                if (url[1]) {
                    request(url[1], url[0]);
                } else {
                    request(url[0]);
                }
            });
            if (this.onafterrequest) {
                this.onafterrequest(context);
            }
        }
    };

    /**
     * esr数据名跟踪插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数
     */
    ext.esr = function (control, value) {
        var values = value.split('@');
        if (autoRender[values[0]]) {
            autoRender[values[0]].push(control);
        } else {
            autoRender[values[0]] = [control];
        }

        if (values.length >= 3) {
            control.setData = new Function('$', 'this.setContent(' + dom.getText(control.getBody()) + ')');
            control.setContent('');
        } else if (values[1]) {
            control.getBody().appendChild(dom.create());
            control.$setBody(control.getBody().lastChild);
            control.setData = function () {
                core.dispose(this.getBody());
                this.getBody().innerHTML = etpl.render(values[1], context);
                core.init(this.getBody());
            };
        }

        if (context[values[0]] !== undefined) {
            setData(control, context[values[0]]);
        }
        core.addEventListener(control, 'dispose', function () {
            util.remove(autoRender[values[0]], this);
        });
    };
}());

/**
 * ETPL (Enterprise Template)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 模板引擎
 * @author errorrik(errorrik@gmail.com)
 *         otakustay(otakustay@gmail.com)
 */


// HACK: 可见的重复代码未抽取成function和var是为了gzip size，吐槽的一边去
/* eslint-env node */

(function () {

    /**
     * 唯一id的起始值
     *
     * @inner
     * @type {number}
     */
    var guidIndex = 0;

    /**
     * 获取唯一id，用于匿名target或编译代码的变量名生成
     *
     * @inner
     * @return {string} 唯一id
     */
    function generateGUID() {
        return '_' + (guidIndex++);
    }

    /**
     * 默认filter
     *
     * @inner
     * @const
     * @type {Object}
     */
    var DEFAULT_FILTERS = {
        /**
         * HTML转义filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        html: util.encodeHTML,

        /**
         * URL编码filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        url: encodeURIComponent,

        /**
         * 源串filter，用于在默认开启HTML转义时获取源串，不进行转义
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        raw: function (source) {
            return source;
        }
    };

    /**
     * 对字符串进行可用于new RegExp的字面化
     *
     * @inner
     * @param {string} source 需要字面化的字符串
     * @return {string} 字符串字面化结果
     */
    function regexpLiteral(source) {
        return source.replace(/[\^\[\]\$\(\)\{\}\?\*\.\+]/g, function (c) {
            return '\\' + c;
        });
    }

    /**
     * 用于render的字符串变量声明语句
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_DECLATION = 'var r="";';

    /**
     * 用于render的字符串内容添加语句（起始）
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_ADD_START = 'r+=';

    /**
     * 用于render的字符串内容添加语句（结束）
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_ADD_END = ';';

    /**
     * 用于render的字符串内容返回语句
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_RETURN = 'return r;';

    // HACK: IE8-时，编译后的renderer使用join Array的策略进行字符串拼接
    if (ieVersion < 8) {
        RENDER_STRING_DECLATION = 'var r=[],j=0;';
        RENDER_STRING_ADD_START = 'r[j++]=';
        RENDER_STRING_RETURN = 'return r.join("");';
    }

    /**
     * 将访问变量名称转换成getVariable调用的编译语句
     * 用于if、var等命令生成编译代码
     *
     * @inner
     * @param {string} name 访问变量名
     * @return {string} getVariable调用的编译语句
     */
    function toGetVariableLiteral(name) {
        var args = [];

        name.replace(/^\s*\*/, '').replace(
            /(\[('([^']+)'|"([^"]+)"|[^\]]+)\]|(\.|^)([^.\[]+))/g,
            function (match, all, name, sing, doub, flag, normal) {
                all = sing || doub || normal;
                args.push(all ? '"' + all + '"' : toGetVariableLiteral(name));
            }
        );

        return util.stringFormat(
            'A({0},[{1}])',
            JSON.stringify(name),
            args.join(',')
        );
    }

    /**
     * 解析文本片段中以固定字符串开头和结尾的包含块
     * 用于 命令串：<!-- ... --> 和 变量替换串：${...} 的解析
     *
     * @inner
     * @param {string} source 要解析的文本
     * @param {string} open 包含块开头
     * @param {string} close 包含块结束
     * @param {boolean} greedy 是否贪婪匹配
     * @param {function({string})} onInBlock 包含块内文本的处理函数
     * @param {function({string})} onOutBlock 非包含块内文本的处理函数
     */
    function parseTextBlock(source, open, close, greedy, onInBlock, onOutBlock) {
        var closeLen = close.length;
        var level = 0;
        var buf = [];

        source.split(open).forEach(function (text, i) {
            if (i) {
                var openBegin = 1;
                level++;
                /* eslint-disable no-constant-condition */
                for (;;) {
                    var closeIndex = text.indexOf(close);
                    if (closeIndex < 0) {
                        buf.push(level > 1 && openBegin ? open : '', text);
                        break;
                    }

                    level = greedy ? level - 1 : 0;
                    buf.push(
                        level > 0 && openBegin ? open : '',
                        text.slice(0, closeIndex),
                        level > 0 ? close : ''
                    );
                    text = text.slice(closeIndex + closeLen);
                    openBegin = 0;

                    if (level === 0) {
                        break;
                    }
                }
                /* eslint-enable no-constant-condition */

                if (level === 0) {
                    onInBlock(buf.join(''));
                    onOutBlock(text);
                    buf = [];
                }
            } else if (text) {
                onOutBlock(text);
            }
        });

        if (level > 0 && buf.length > 0) {
            onOutBlock(open);
            onOutBlock(buf.join(''));
        }
    }

    /**
     * 编译变量访问和变量替换的代码
     * 用于普通文本或if、var、filter等命令生成编译代码
     *
     * @inner
     * @param {string} source 源代码
     * @param {Engine} engine 引擎实例
     * @param {boolean} forText 是否为输出文本的变量替换
     * @return {string} 编译代码
     */
    function compileVariable(source, engine, forText) {
        var code = [];

        var toStringHead = '';
        var toStringFoot = '';
        var wrapHead = '';
        var wrapFoot = '';

        // 默认的filter，当forText模式时有效
        var defaultFilter;

        if (forText) {
            toStringHead = 'B(';
            toStringFoot = ')';
            wrapHead = RENDER_STRING_ADD_START;
            wrapFoot = RENDER_STRING_ADD_END;
            defaultFilter = engine.options.defaultFilter;
        }

        parseTextBlock(
            source,
            engine.options.variableOpen,
            engine.options.variableClose,
            1,
            function (text) {
                // 加入默认filter
                // 只有当处理forText时，需要加入默认filter
                // 处理if/var/use等command时，不需要加入默认filter
                if (forText && text.indexOf('|') < 0 && defaultFilter) {
                    text += '|' + defaultFilter;
                }

                // variableCode是一个A调用，然后通过循环，在外面包filter的调用
                // 形成filter["b"](filter["a"](A(...)))
                //
                // 当forText模式，处理的是文本中的变量替换时
                // 传递给filter的需要是字符串形式，所以A外需要包一层B调用
                // 形成filter["b"](filter["a"](B(A(...))))
                //
                // 当variableName以*起始时，忽略B调用，直接传递原值给filter
                var filterCharIndex = text.indexOf('|');
                var variableName = (filterCharIndex > 0 ? text.slice(0, filterCharIndex) : text).replace(/^\s+/, '').replace(/\s+$/, '');
                var filterSource = filterCharIndex > 0 ? text.slice(filterCharIndex + 1) : '';

                var variableRawValue = variableName.indexOf('*') === 0;
                var variableCode = [
                    variableRawValue ? '' : toStringHead,
                    toGetVariableLiteral(variableName),
                    variableRawValue ? '' : toStringFoot
                ];

                if (filterSource) {
                    filterSource = compileVariable(filterSource, engine);
                    filterSource.split('|').forEach(function (seg) {
                        if (/^\s*([a-z0-9_-]+)(\((.*)\))?\s*$/i.test(seg)) {
                            variableCode.unshift('f["' + RegExp.$1 + '"](');

                            if (RegExp.$3) {
                                variableCode.push(',', RegExp.$3);
                            }

                            variableCode.push(')');
                        }
                    });
                }

                code.push(
                    wrapHead,
                    variableCode.join(''),
                    wrapFoot
                );
            },

            function (text) {
                code.push(
                    wrapHead,
                    forText ? JSON.stringify(text) : text,
                    wrapFoot
                );
            }
        );

        return code.join('');
    }

    /**
     * 文本节点类
     *
     * @inner
     * @constructor
     * @param {string} value 文本节点的内容文本
     * @param {Engine} engine 引擎实例
     */
    function TextNode(value, engine) {
        this.value = value;
        this.engine = engine;
    }

    TextNode.prototype = {
        /**
         * 获取renderer body的生成代码
         *
         * @return {string} 生成代码
         */
        getRendererBody: function () {
            if (!this.value || (this.engine.options.strip && /^\s*$/.test(this.value))) {
                return '';
            }

            return compileVariable(this.value, this.engine, 1);
        },

        /**
         * 复制节点的方法
         *
         * @return {TextNode} 节点复制对象
         */
        clone: function () {
            return this;
        }
    };

    /**
     * 命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function Command(value, engine) {
        this.value = value;
        this.engine = engine;
        this.children = [];
        this.cloneProps = [];
    }

    Command.prototype = {
        /**
         * 添加子节点
         *
         * @param {TextNode|Command} node 子节点
         */
        addChild: function (node) {
            this.children.push(node);
        },

        /**
         * 节点open，解析开始
         *
         * @param {Object} context 语法分析环境对象
         */
        open: function (context) {
            var parent = context.stack.top();
            if (parent) {
                parent.addChild(this);
            }
            context.stack.push(this);
        },

        /**
         * 节点闭合，解析结束
         *
         * @param {Object} context 语法分析环境对象
         */
        close: function (context) {
            if (context.stack.top() === this) {
                context.stack.pop();
            }
        },

        /**
         * 获取renderer body的生成代码
         *
         * @return {string} 生成代码
         */
        getRendererBody: function () {
            return this.children.map(function (child) {
                return child.getRendererBody();
            }).join('');
        },

        /**
         * 复制节点的方法
         *
         * @return {Command} 节点复制对象
         */
        clone: function () {
            var node = new this.constructor(this.value, this.engine);

            this.children.forEach(function (child) {
                node.addChild(child.clone());
            });

            this.cloneProps.forEach(function (prop) {
                node[prop] = this[prop];
            }, this);

            return node;
        }
    };

    /**
     * 命令自动闭合
     *
     * @inner
     * @param {Object} context 语法分析环境对象
     * @param {Function=} CommandType 自闭合的节点类型
     * @return {Command} 被闭合的节点
     */
    function autoCloseCommand(context, CommandType) {
        var closeEnd = CommandType ? context.stack.find(
                function (item) {
                    return item instanceof CommandType;
                }
            ) : context.stack[0];

        if (closeEnd) {
            var node;

            for (; (node = context.stack.top()) !== closeEnd; ) {
                // 如果节点对象不包含autoClose方法
                // 则认为该节点不支持自动闭合，需要抛出错误
                // for等节点不支持自动闭合
                if (!node.autoClose) {
                    throw new Error(node.type + ' must be closed manually: ' + node.value);
                }

                node.autoClose(context);
            }

            closeEnd.close(context);
        }

        return closeEnd;
    }

    /**
     * renderer body起始代码段
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDERER_BODY_START =
        'u=u||{};' +
        'var v={},f=e.filters,g="function"==typeof u.get,' +
        //a:name b:properties
        'A=function(a,b){' +
        'var d=v[b[0]];' +
        'if(d==null){' +
        'if(g)return u.get(a);' +
        'd=u[b[0]];' +
        'if(d==null)d=this[b[0]];' +
        '}' +
        'for(var i=1,l=b.length;i<l;i++)if(d!=null)d=d[b[i]];' +
        'return d;' +
        '},' +
        'B=function(a){' +
        'if("string"===typeof a)return a;' +
        'if(a==null)a="";' +
        'return ""+a;' +
        '};';

    // v: variables
    // f: filters
    // A: getVariable
    // B: toString
    // g: hasGetter

    /**
     * Target命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function TargetCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*(\(\s*master\s*=\s*([a-z0-9\/_-]+)\s*\))?\s*/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.master = RegExp.$3;
        this.name = RegExp.$1;
        Command.call(this, value, engine);

        this.blocks = {};
    }

    // 创建Target命令节点继承关系
    util.inherits(TargetCommand, Command);

    /**
     * Block命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function BlockCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        Command.call(this, value, engine);
        this.cloneProps = ['name'];
    }

    // 创建Block命令节点继承关系
    util.inherits(BlockCommand, Command);

    /**
     * Import命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ImportCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'state', 'blocks'];
        this.blocks = {};
    }

    // 创建Import命令节点继承关系
    util.inherits(ImportCommand, Command);

    /**
     * Var命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function VarCommand(value, engine) {
        if (!/^\s*([a-z0-9_]+)\s*=([\s\S]*)$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        this.expr = RegExp.$2;
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'expr'];
    }

    // 创建Var命令节点继承关系
    util.inherits(VarCommand, Command);

    /**
     * filter命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function FilterCommand(value, engine) {
        if (!/^\s*([a-z0-9_-]+)\s*(\(([\s\S]*)\))?\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        this.args = RegExp.$3;
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'args'];
    }

    // 创建filter命令节点继承关系
    util.inherits(FilterCommand, Command);

    /**
     * Use命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function UseCommand(value, engine) {
        if (!/^\s*([^(\s]+)\s*(\(([\s\S]*)\))?\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        this.args = RegExp.$3;
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'args'];
    }

    // 创建Use命令节点继承关系
    util.inherits(UseCommand, Command);

    /**
     * for命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ForCommand(value, engine) {
        var rule = new RegExp(
            util.stringFormat(
                '^\\s*({0}[\\s\\S]+{1})\\s+as\\s+{0}([0-9a-z_]+){1}\\s*(,\\s*{0}([0-9a-z_]+){1})?\\s*$',
                regexpLiteral(engine.options.variableOpen),
                regexpLiteral(engine.options.variableClose)
            ),
            'i'
        );

        if (!rule.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.list = RegExp.$1;
        this.item = RegExp.$2;
        this.index = RegExp.$4;
        Command.call(this, value, engine);
        this.cloneProps = ['list', 'item', 'index'];
    }

    // 创建for命令节点继承关系
    util.inherits(ForCommand, Command);

    /**
     * if命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function IfCommand(value, engine) {
        Command.call(this, value, engine);
    }

    // 创建if命令节点继承关系
    util.inherits(IfCommand, Command);

    /**
     * elif命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ElifCommand(value, engine) {
        IfCommand.call(this, value, engine);
    }

    // 创建elif命令节点继承关系
    util.inherits(ElifCommand, IfCommand);

    /**
     * else命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ElseCommand(value, engine) {
        Command.call(this, value, engine);
    }

    // 创建else命令节点继承关系
    util.inherits(ElseCommand, IfCommand);

    /**
     * Target的节点状态
     *
     * @inner
     */
    var TargetState = {
        READING: 1,
        READED: 2,
        APPLIED: 3,
        READY: 4
    };

    /**
     * 应用其继承的母版，返回是否成功应用母版
     *
     * @param {string} masterName 模板名称
     * @return {boolean} 是否成功应用母版
     */
    ImportCommand.prototype.applyMaster = TargetCommand.prototype.applyMaster = function (masterName) {
        if (this.state >= TargetState.APPLIED) {
            return 1;
        }

        var blocks = this.blocks;

        function replaceBlock(node) {
            var children = node.children;

            if (children instanceof Array) {
                children.forEach(function (child, index) {
                    if (child instanceof BlockCommand && blocks[child.name]) {
                        child = children[index] = blocks[child.name];
                    }

                    replaceBlock(child);
                });
            }
        }

        var master = this.engine.targets[masterName];
        if (master && master.applyMaster(master.master)) {
            this.children = master.clone().children;
            replaceBlock(this);
            this.state = TargetState.APPLIED;
            return 1;
        }
    };

    /**
     * 判断target是否ready
     * 包括是否成功应用母版，以及import语句依赖的target是否ready
     *
     * @return {boolean} target是否ready
     */
    TargetCommand.prototype.isReady = function () {
        if (this.state >= TargetState.READY) {
            return 1;
        }

        var engine = this.engine;
        var readyState = 1;

        /**
         * 递归检查节点的ready状态
         *
         * @inner
         * @param {Command|TextNode} node 目标节点
         */
        function checkReadyState(node) {
            node.children.forEach(function (child) {
                if (child instanceof ImportCommand) {
                    var target = engine.targets[child.name];
                    readyState = readyState && target && target.isReady(engine);
                } else if (child instanceof Command) {
                    checkReadyState(child);
                }
            });
        }

        if (this.applyMaster(this.master)) {
            checkReadyState(this);
            if (readyState) {
                this.state = TargetState.READY;
            }
            return readyState;
        }
    };

    /**
     * 获取target的renderer函数
     *
     * @return {function(Object):string} renderer函数
     */
    TargetCommand.prototype.getRenderer = function () {
        if (this.renderer) {
            return this.renderer;
        }

        if (this.isReady()) {
            // console.log(this.name + ' ------------------');
            // console.log(RENDERER_BODY_START + RENDER_STRING_DECLATION
            //     + this.getRendererBody()
            //     + RENDER_STRING_RETURN);

            var realRenderer = new Function(
                'u',
                'e',
                [
                    RENDERER_BODY_START,
                    RENDER_STRING_DECLATION,
                    this.getRendererBody(),
                    RENDER_STRING_RETURN
                ].join('')
            );

            var engine = this.engine;
            this.renderer = function (data) {
                return realRenderer(data, engine);
            };

            return this.renderer;
        }

        return null;
    };

    /**
     * 将target节点对象添加到语法分析环境中
     *
     * @inner
     * @param {TargetCommand} target target节点对象
     * @param {Object} context 语法分析环境对象
     */
    function addTargetToContext(target, context) {
        context.target = target;

        if (context.engine.targets[target.name]) {
            switch (context.engine.options.namingConflict) {
            case 'override':
                context.engine.targets[target.name] = target;
                context.targets.push(target.name);
                break;
            case 'ignore':
                break;
            default:
                throw new Error('Target exists: ' + target.name);
            }
        } else {
            context.engine.targets[target.name] = target;
            context.targets.push(target.name);
        }
    }

    /**
     * target节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    TargetCommand.prototype.open = function (context) {
        autoCloseCommand(context);
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
        addTargetToContext(this, context);
    };

    /**
     * Var/Use节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    VarCommand.prototype.open = UseCommand.prototype.open = function (context) {
        context.stack.top().addChild(this);
    };

    /**
     * Block节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    BlockCommand.prototype.open = function (context) {
        Command.prototype.open.call(this, context);
        (context.imp || context.target).blocks[this.name] = this;
    };

    /**
     * elif节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    ElifCommand.prototype.open = function (context) {
        var elseCommand = new ElseCommand();
        elseCommand.open(context);

        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };

    /**
     * else节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    ElseCommand.prototype.open = function (context) {
        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };

    /**
     * import节点open，解析开始
     *
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.open = function (context) {
        this.parent = context.stack.top();
        this.target = context.target;
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
        context.imp = this;
    };

    /**
     * 节点解析结束
     * 由于var/use节点无需闭合，处理时不会入栈，所以将close置为空函数
     *
     * @param {Object} context 语法分析环境对象
     */
    UseCommand.prototype.close = VarCommand.prototype.close = function () {};

    /**
     * 节点解析结束
     *
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = TargetState.READED;
        context.imp = null;
    };

    /**
     * 节点闭合，解析结束
     *
     * @param {Object} context 语法分析环境对象
     */
    TargetCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = this.master ? TargetState.READED : TargetState.APPLIED;
        context.target = null;
    };

    /**
     * 节点自动闭合，解析结束
     * ImportCommand的自动结束逻辑为，在其开始位置后马上结束
     * 所以，其自动结束时children应赋予其所属的parent
     *
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.autoClose = function (context) {
        // move children to parent
        this.parent.children.push.apply(this.parent.children, this.children);
        this.children.length = 0;

        // move blocks to target
        for (var key in this.blocks) {
            if (this.blocks.hasOwnProperty(key)) {
                this.target.blocks[key] = this.blocks[key];
            }
        }
        this.blocks = {};

        // do close
        this.close(context);
    };

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {Object} context 语法分析环境对象
     */
    UseCommand.prototype.beforeOpen = ImportCommand.prototype.beforeOpen = VarCommand.prototype.beforeOpen = ForCommand.prototype.beforeOpen = FilterCommand.prototype.beforeOpen = BlockCommand.prototype.beforeOpen = IfCommand.prototype.beforeOpen = TextNode.prototype.beforeAdd = function (context) {
        if (context.stack[0]) {
            return;
        }

        var target = new TargetCommand(generateGUID(), context.engine);
        target.open(context);
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ImportCommand.prototype.getRendererBody = function () {
        this.applyMaster(this.name);
        return Command.prototype.getRendererBody.call(this);
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    UseCommand.prototype.getRendererBody = function () {
        var rule = new RegExp(
            util.stringFormat(
                '{0}([^}]+){1}',
                regexpLiteral(this.engine.options.variableOpen),
                regexpLiteral(this.engine.options.variableClose)
            ),
            'g'
        );

        return util.stringFormat(
            '{0}e.render({2},{3}){1}',
            RENDER_STRING_ADD_START,
            RENDER_STRING_ADD_END,
            JSON.stringify(this.name).replace(
                rule,
                function (match, name) {
                    return '"+' + toGetVariableLiteral(name) + '+"';
                }
            ),
            this.args ? '{' + compileVariable(this.args, this.engine).replace(
                /(^|,)\s*([a-z0-9_]+)\s*=/ig,
                function (match, start, argName) {
                    return (start || '') + JSON.stringify(argName) + ':';
                }
            ) + '}' : 'u'
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    VarCommand.prototype.getRendererBody = function () {
        if (this.expr) {
            return util.stringFormat(
                'v[{0}]={1};',
                JSON.stringify(this.name),
                compileVariable(this.expr, this.engine)
            );
        }

        return '';
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    IfCommand.prototype.getRendererBody = function () {
        return util.stringFormat(
            'if({0}){{1}}',
            compileVariable(this.value, this.engine),
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ElseCommand.prototype.getRendererBody = function () {
        return util.stringFormat(
            '}else{{0}',
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ForCommand.prototype.getRendererBody = function () {
        return util.stringFormat(
            'var {0}={1};' +
                'if({0} instanceof Array)' +
                'for(var {4}=0,{5}={0}.length;{4}<{5};{4}++){v[{2}]={4};v[{3}]={0}[{4}];{6}}' +
                'else if(typeof {0}==="object")' +
                'for(var {4} in {0}){v[{2}]={4};v[{3}]={0}[{4}];{6}}',
            generateGUID(),
            compileVariable(this.list, this.engine),
            JSON.stringify(this.index || generateGUID()),
            JSON.stringify(this.item),
            generateGUID(),
            generateGUID(),
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    FilterCommand.prototype.getRendererBody = function () {
        var args = this.args;
        return util.stringFormat(
            '{2}f[{5}]((function(){{0}{4}{1}})(){6}){3}',
            RENDER_STRING_DECLATION,
            RENDER_STRING_RETURN,
            RENDER_STRING_ADD_START,
            RENDER_STRING_ADD_END,
            Command.prototype.getRendererBody.call(this),
            JSON.stringify(this.name),
            args ? ',' + compileVariable(args, this.engine) : ''
        );
    };

    /**
     * 命令类型集合
     *
     * @type {Object}
     */
    var commandTypes = {};

    /**
     * 添加命令类型
     *
     * @inner
     * @param {string} name 命令名称
     * @param {Function} Type 处理命令用到的类
     */
    function addCommandType(name, Type) {
        commandTypes[name] = Type;
        Type.prototype.type = name;
    }

    addCommandType('target', TargetCommand);
    addCommandType('block', BlockCommand);
    addCommandType('import', ImportCommand);
    addCommandType('use', UseCommand);
    addCommandType('var', VarCommand);
    addCommandType('for', ForCommand);
    addCommandType('if', IfCommand);
    addCommandType('elif', ElifCommand);
    addCommandType('else', ElseCommand);
    addCommandType('filter', FilterCommand);


    /**
     * etpl引擎类
     *
     * @constructor
     * @param {Object=} options 引擎参数
     * @param {string=} options.commandOpen 命令语法起始串
     * @param {string=} options.commandClose 命令语法结束串
     * @param {string=} options.variableOpen 变量语法起始串
     * @param {string=} options.variableClose 变量语法结束串
     * @param {string=} options.defaultFilter 默认变量替换的filter
     * @param {boolean=} options.strip 是否清除命令标签前后的空白字符
     * @param {string=} options.namingConflict target名字冲突时的处理策略
     */
    function Engine(options) {
        this.options = {
            commandOpen: '<!--',
            commandClose: '-->',
            commandSyntax: /^\s*(\/)?([a-z]+)\s*(?::([\s\S]*))?$/,
            variableOpen: '${',
            variableClose: '}',
            defaultFilter: 'html'
        };

        this.config(options);
        this.targets = {};
        this.filters = util.extend({}, DEFAULT_FILTERS);
    }

    /**
     * 配置引擎参数，设置的参数将被合并到现有参数中
     *
     * @param {Object} options 参数对象
     * @param {string=} options.commandOpen 命令语法起始串
     * @param {string=} options.commandClose 命令语法结束串
     * @param {string=} options.variableOpen 变量语法起始串
     * @param {string=} options.variableClose 变量语法结束串
     * @param {string=} options.defaultFilter 默认变量替换的filter
     * @param {boolean=} options.strip 是否清除命令标签前后的空白字符
     * @param {string=} options.namingConflict target名字冲突时的处理策略
     */
    Engine.prototype.config = function (options) {
        util.extend(this.options, options);
    };

   /**
     * 解析模板并编译，返回第一个target编译后的renderer函数。
     * parse该方法的存在为了兼容老模板引擎
     *
     * @param {string} source 模板源代码
     * @return {function(Object):string} renderer函数
     */
    Engine.prototype.compile = Engine.prototype.parse = function (source) {
        if (source) {
            var targetNames = parseSource(source, this);
            if (targetNames.length) {
                return this.targets[targetNames[0]].getRenderer();
            }
        }

        return new Function('return ""');
    };

    /**
     * 根据target名称获取编译后的renderer函数
     *
     * @param {string} name target名称
     * @return {function(Object):string} renderer函数
     */
    Engine.prototype.getRenderer = function (name) {
        var target = this.targets[name];
        if (target) {
            return target.getRenderer();
        }
    };

    /**
     * 执行模板渲染，返回渲染后的字符串。
     *
     * @param {string} name target名称
     * @param {Object=} data 模板数据。
     *      可以是plain object，
     *      也可以是带有 {string}get({string}name) 方法的对象
     * @return {string} 渲染结果
     */
    Engine.prototype.render = function (name, data) {
        var renderer = this.getRenderer(name);
        if (renderer) {
            return renderer(data);
        }

        return '';
    };

    /**
     * 增加过滤器
     *
     * @param {string} name 过滤器名称
     * @param {Function} filter 过滤函数
     */
    Engine.prototype.addFilter = function (name, filter) {
        if ('function' === typeof filter) {
            this.filters[name] = filter;
        }
    };

    /**
     * 解析源代码
     *
     * @inner
     * @param {string} source 模板源代码
     * @param {Engine} engine 引擎实例
     * @return {Array} target名称列表
     */
    function parseSource(source, engine) {
        var commandOpen = engine.options.commandOpen;
        var commandClose = engine.options.commandClose;
        var commandSyntax = engine.options.commandSyntax;

        var stack = [];
        var analyseContext = {
            engine: engine,
            targets: [],
            stack: stack,
            target: null
        };

        // text节点内容缓冲区，用于合并多text
        var textBuf = [];

        stack.top = function () {
            return this[this.length - 1];
        };

        stack.find = function (condition) {
            for (var index = this.length; index--; ) {
                var item = this[index];
                if (condition(item)) {
                    return item;
                }
            }
        };

        /**
         * 将缓冲区中的text节点内容写入
         *
         * @inner
         */
        function flushTextBuf() {
            var text;
            if (textBuf.length > 0 && (text = textBuf.join(''))) {
                var textNode = new TextNode(text, engine);
                textNode.beforeAdd(analyseContext);

                stack.top().addChild(textNode);
                textBuf = [];

                if (engine.options.strip && analyseContext.current instanceof Command) {
                    textNode.value = text.replace(/^[\x20\t\r]*\n/, '');
                }
                analyseContext.current = textNode;
            }
        }

        var NodeType;

        parseTextBlock(
            source,
            commandOpen,
            commandClose,
            0,
            function (text) { // <!--...-->内文本的处理函数
                var match = commandSyntax.exec(text);

                // 符合command规则，并且存在相应的Command类，说明是合法有含义的Command
                // 否则，为不具有command含义的普通文本
                if (match && (NodeType = commandTypes[match[2].toLowerCase()]) && typeof NodeType === 'function') {
                    // 先将缓冲区中的text节点内容写入
                    flushTextBuf();

                    var currentNode = analyseContext.current;
                    if (engine.options.strip && currentNode instanceof TextNode) {
                        currentNode.value = currentNode.value.replace(/\r?\n[\x20\t]*$/, '\n');
                    }

                    if (match[1]) {
                        currentNode = autoCloseCommand(analyseContext, NodeType);
                    } else {
                        currentNode = new NodeType(match[3], engine);
                        if (typeof currentNode.beforeOpen === 'function') {
                            currentNode.beforeOpen(analyseContext);
                        }
                        currentNode.open(analyseContext);
                    }

                    analyseContext.current = currentNode;
                } else if (!/^\s*\/\//.test(text)) {
                    // 如果不是模板注释，则作为普通文本，写入缓冲区
                    textBuf.push(commandOpen, text, commandClose);
                }

                NodeType = null;
            },

            function (text) { // <!--...-->外，普通文本的处理函数
                // 普通文本直接写入缓冲区
                textBuf.push(text);
            }
        );

        flushTextBuf(); // 将缓冲区中的text节点内容写入
        autoCloseCommand(analyseContext);

        return analyseContext.targets;
    }

    etpl = new Engine();
    etpl.Engine = Engine;
}());
}());
