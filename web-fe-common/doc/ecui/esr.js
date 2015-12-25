(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        io = core.io,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
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
            pauseStatus = true;console.log(pauseStatus);
            io.loadScript( 
                name + '/' + name + '.js',
                function () {
                    pauseStatus = false;
                    callRoute(name, options);
                },
                {
                    onerror: function () {
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
//{if 0}//
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
            core.esr.loadRoute = function (filename) {
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
//{/if}//
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
                    return context[name] || '';
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
