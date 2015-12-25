/*
Pagenation - 分页导航组件。
支持设置的选项：
max : 最多同时显示好多页
curr : 当前页码
size : 每页显示多少条，默认15。可以是15,30,50的任一个，如果传为false，则不显示切换每页显示条数的标签
pages : 总好多页。可以不传而只传items，则会由items和size计算出pages
items : 总数据条数。
onpagination : 函数，在页码跳转时触发，此函数执行时会自动传入两个参数：page（当前页）, size（当前页显示条数）
info : 是否显示页码信息，默认true，会加入一个page-text用来显示“共N页，当前是第n页”这样的信息
jump : 是否允许输入页码跳页，默认true,会加入一个页码输入框和确定按钮
prev ：上一页按钮显示的文字，设为false则不显示上一页按钮，下同
next ：下一页按钮显示的文字，同上
last ：末页按钮显示的文字，同上
first ：首页按钮显示的文字，同上

属性：
options : 对象，上面列出的静态设置选项
currPageElement : 当前页码的node
pageList : Node数组，页码node的列表

*/
(function () {
    //{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        //{/if}//
        defaults = {
            prev: '&lt; 上一页',
            next: '下一页 &gt;',
            last: '&gt;&gt;',
            first: '&lt;&lt;',
            size: 15,
            max: 8,
            pages: 0,
            items: 0,
            curr: 1,
            info: true,
            jump: true
        },
        // 找到符合条件的最近的父级元素
        closet = function (elm, fn) {
            while (elm) {
                if (fn(elm)) {
                    return elm;
                }
                elm = elm.parentNode;
            }
        },
        // 隐藏某元素
        hide = function (elm, f) {
            elm.style.display = f === undefined ? 'none' : f;
        },
        // 根据当前页，总数页，最多显示页计算出应显示的页码
        pageCalc = function (curr, pages, max) {
            //console.log('curr,pages,max',curr,pages,max)
            var start = 1,
                // var end = max;
                //var truehalf = max / 2;
                half = Math.floor(max / 2),
                maxLength = Math.min(pages, max) - 1;
            // if (pages < end) {
            //     end  = pages;
            // }
            //console.log('start,half,max',start,half,max)
            //如果当前页大于最多显示页的一半，当前页放中间
            if (pages > max && curr >= half) {
                start = curr - half;
                // end =  (curr + half) > pages ? pages : curr + half;
                if (curr === pages - 1) {
                    // start = curr - half -(half<truehalf ? 1 : 2);
                    start = curr - (half + 1);
                }
                if (curr === pages) {
                    start = curr - maxLength;
                    start = start || 1;
                }
            }
            if (start + maxLength > pages) {
                start = pages - maxLength;
            }
            start = start > 0 ? start : 1;
            return start;
        },
        pageActive = 'page-item-active',
        pageItem = 'page-item',
        pageHover = 'page-item-hover',
        pageDisable = 'disable';
    ui.Pagination = core.inherits(
        ui.Control,
        'ui-pagination',
        function (el, options) {
            this.options = util.extend({}, defaults);
            util.extend(this.options, options);
            var root = this,
                Options = root.options,
                pages = (Options.pages -= 0),
                curr = (Options.curr -= 0),
                max = (Options.max -= 0),
                temp,
                items = [],
                start,
                end,
                pi,
                jumpinput,
                jumpbt,
                noNext,
                list,
                pp,
                page,
                target,
                li,
                plStart = 0,
                plEnd = 0,
                i,
                pageList,
                elli;
            if (pages === 0) {
                pages = Options.pages = Math.ceil(Options.items / (Options.size || 15));
            }
            var pageCodes = {
                first: 1,
                last: pages,
                next: function () {
                    return Options.curr >= pages ? pages : Options.curr + 1;
                },
                prev: function () {
                    return Options.curr <= 1 ? 1 : Options.curr - 1;
                }
            };
            temp = el;
            if (el.tagName === 'UL') {
                var div = dom.create('page-list-wrap');
                el.parentNode.replaceChild(el, div);
                div.appendChild(temp);
                temp = div;
            } else {
                el = dom.create('page-list', 'UL');
                temp.appendChild(el);
                if (!dom.hasClass(temp, 'page-list-wrap')) {
                    dom.addClass(temp, 'page-list-wrap');
                }
            }
            if (Options.first) {
                plStart += 1;
                items.push('<li class="' + pageItem + '" ui-page="first">' + Options.first + '</li>');
            }
            if (Options.prev) {
                plStart += 1;
                items.push('<li class="page-btn-prev" ui-page="prev">' + Options.prev + '</li>');
            }
            // items.push('<li class="' + pageItem +'" ui-page="1">1</li>');
            start = pageCalc(curr, pages, max);
            end = start + (max - 1);
            if (end > pages) {
                end = pages;
            }
            pageList = [];
            max = Math.min(max, pages);
            for (i = 1; i <= max; i++) {
                pageList.push('<li class="' + pageItem + '" ui-page="' + i + '">' + i + '</li>');
            }
            // 如果总页数超过最大显示 页，生成省略页码
            if (pages > max) {
                elli = '<li class="page-ellipsis" ui-page="ellipsis">...</li>';
                pageList.splice(1, 0, elli);
                pageList.splice(pageList.length - 1, 0, elli);
            }
            pageList[pageList.length - 1] = '<li class="' + pageItem + '" ui-page="' + pages + '">' + pages + '</li>';
            items = items.concat(pageList);
            noNext = (curr === pages || pages === 0) ? pageDisable : pageItem;
            if (Options.next) {
                plEnd += 1;
                items.push('<li class="page-btn-next" ui-page="next">' + Options.next + '</li>');
            }
            if (Options.last) {
                plEnd += 1;
                items.push('<li class="last-page ' + noNext + '" ui-page="last">' + Options.last + '</li>');
            }
            el.innerHTML = items.join('');
            ui.Control.constructor.call(root, el, options);
            list = dom.children(el);
            root.pageList = list.slice(plStart, -plEnd);
            // console.log(list, items, plStart, -plEnd);
            // 如果总页数超过最大显示页，取出省略页码
            if (pages > max) {
                root.ellipsis = root.pageList.splice(1, 1);
                root.ellipsis.push(root.pageList.splice(-2, 1)[0]);
            }

            if (Options.size) {
                Options.size -= 0;
                var ul = dom.create('page-list page-size', 'ul'),
                    sizes = {
                        15: 0,
                        30: 1,
                        50: 2
                    };
                ul.innerHTML = '<li class="page-item">15</li><li class="page-item">30</li><li class="page-item">50</li>';
                temp.insertBefore(ul, el);
                dom.addClass(ul.children[sizes[Options.size]], pageHover);
                ul.onclick = function (event) {
                    event = core.wrapEvent(event);
                    target = event.target;
                    li = target.tagName === 'LI' ? target : closet(target, function (elm) {
                        return elm.tagName === 'LI';
                    });
                    if (!dom.hasClass(li, pageHover)) {
                        var num = +li.innerHTML;
                        root.options.size = num;
                        if (root.onpagination) {
                            root.onpagination(Options.curr, num);
                        }
                        for (i = 0; i < 3; i++) {
                            dom.removeClass(ul.children[i], pageHover);
                        }
                        dom.addClass(li, pageHover);
                    }
                };
            }
            if (Options.info) {
                pi = dom.create('page-text', 'li');
                if (Options.items) {
                    pi.innerHTML = '共' + Options.items + '条';
                } else {
                    pi.innerHTML = '共' + pages + '页';
                }
                root.info = el.appendChild(pi);
            }
            if (Options.jump) {
                jumpinput = dom.create('page-text page-input', 'li');
                jumpinput.innerHTML = '到第<span class="mid-helper"></span><input type="text" class="mid-text page-position">页';
                jumpbt = dom.create('page-btn btn', 'li');
                jumpbt.innerHTML = '确定';
                el.appendChild(jumpinput);
                jumpinput.onkeydown = function (e) {
                    e = core.wrapEvent(e);
                    var input = this.getElementsByTagName('input')[0],
                        value = +input.value;
                    if (!isNaN(value) && (e.which === 13)) {
                        root.go(+value);
                    }
                };
                root.jump = el.appendChild(jumpbt);
                root.jump.onclick = function () {
                    page = this.previousSibling.getElementsByTagName('input')[0].value;
                    if (!isNaN(+page)  && page !== '') {
                        root.go(+page);
                    }
                };
            }
            el.onclick = function (event) {
                curr = Options.curr;
                //console.log(curr)
                event = core.wrapEvent(event);
                target = event.target;
                li = target.tagName === 'LI' ? target : closet(target, function (elm) {
                    return elm.tagName === 'LI';
                });
                page = li.getAttribute('ui-page');
                if (page) {
                    if (pageCodes[page]) {
                        pp = pageCodes[page];
                        page = 'function' === typeof pp ? pp() : pp;
                    }
                    if (curr !== page) {
                        root.go(+page);
                    }
                }
            };
            root.go(Options.curr);
        },
        {
            // 跳转到指定页
            go: function (page) {
                var root = this,
                    pageList = root.pageList,
                    ellipsis = root.ellipsis,
                    pl = pageList.length,
                    Options = root.options,
                    max = Options.max,
                    pages = Options.pages,
                    // start = pageCalc(page, Options.pages, Options.max),
                    li,
                    i = 1,
                    num,
                    showPages = 'center',
                    prev = pageList[0].previousSibling,
                    next = pageList[pl - 1].nextSibling;
                if ('number' !== typeof page || page < 1 || page > pages) {
                    window.alert('页码必须是1~' + Options.pages + '间的数字!');
                    return;
                }
                // 容错。防止有人通过JS直接跳转不存在的页
                page = page > Options.pages ? Options.pages : (page < 1 ? 1 : page);
                Options.curr = page;
                if (root.currPageElement) {
                    dom.removeClass(root.currPageElement, pageActive);
                }
                root.currPageElement = null;

                if (root.onpagination) {
                    root.onpagination(page, Options.size);
                }
                /*if (root.hasEllipsis) {
                    // root.pageList[0].previousSibling.style.display = start > 1 ? '' : 'none';
                    pageList[pl - 1].nextSibling.style.display = start + (Options.max - 1) < Math.max(Options.pages, Options.max) ? '' : 'none';
                }*/
                function setActive(li) {
                    dom.addClass(li, pageActive);
                    root.currPageElement = li;
                }

                function setPageNumbers(start) {
                    // console.log(start);
                    if (start > pages - max + 1) {
                        start = pages - max + 2;
                    }
                    // console.log(start);
                    for (i = 1; i < pl - 1; i++) {
                        li = pageList[i];
                        num = start + i - 1;
                        li.innerHTML = num;
                        li.setAttribute('ui-page', num);
                        if (num === page) {
                            setActive(li);
                        }
                    }
                }
                // console.log(start,page)
                if (pages <= max) {
                    setActive(pageList[page - 1]);
                    // hide(ellipsis[0]);
                    // hide(ellipsis[1]);
                } else {
                    if (page <= max / 2) {
                        showPages = 'start';
                    } else if (page >= Math.floor(pages - max / 2)) {
                        showPages = 'end';
                    }
                    if (showPages === 'center') {
                        hide(ellipsis[0], '');
                        hide(ellipsis[1], '');
                        setPageNumbers(page - Math.floor(max / 2 / 2));
                    } else if (showPages === 'start') {
                        hide(ellipsis[0]);
                        hide(ellipsis[1], '');
                        setPageNumbers(2);
                    } else {
                        hide(ellipsis[0], '');
                        hide(ellipsis[1]);
                        setPageNumbers(Math.floor(pages - max / 2));
                    }
                }
                if (page === 1) {
                    setActive(pageList[0]);
                    dom.addClass(prev, pageDisable);
                } else {
                    dom.removeClass(prev, pageDisable);
                }
                if (page === pages) {
                    setActive(pageList[pl - 1]);
                    dom.addClass(next, pageDisable);
                } else {
                    dom.removeClass(next, pageDisable);
                }

                if (root.jump) {
                    root.jump.previousSibling.getElementsByTagName('input')[0].value = page;
                }
                // console.log(page,start,root.currPageElement)
            }
        }
    );
}());
