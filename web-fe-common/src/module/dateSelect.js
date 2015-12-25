/*
dateSelect - 日期选择组件。
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
    //{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
    //{/if}//

    /*
     *格式化date
     */
    var dateFormat = (function () {
        function bu0(src, num) {
            src += '';
            return src.length < num ? ('0000' + src).slice(-num) : src;
        }
        var dateReg = /y{3,4}|M{1,2}|m{1,2}|d{1,4}|H{1,2}|h{1,2}|s{1,4}|tt|q/g,
            fnLabels = ['yyyy', 'd', 'dddd', 'H', 'm', 's', 'sss'],
            fnNames = ['getFullYear', 'getDate', 'getDay', 'getHours', 'getMinutes', 'getSeconds', 'getMilliseconds'],
            bu0Labels = ['MM', 'dd', 'HH', 'hh', 'mm', 'ss'],
            plus1 = function (m) {
                return +m  + 1;
            },
            defaultStrings = {
                dddd: ['日', '一', '二', '三', '四', '五', '六'],
                M: plus1,
                q: plus1,
                tt: function (d) {
                    return d > 1 ? 'PM' : 'AM';
                }
            },
            defaultFormat = 'yyyy-MM-dd',
            formats = {
                h: function (d) {
                    return d.getHours() % 12 || 12;
                },
                M: function (d) {
                    return d.getMonth() + 1;
                },
                q: function (d) {
                    return Math.floor(d.getMonth() / 3);
                },
                tt: function (d) {
                    return d.getHours() / 12;
                },
                ssss: function (d) {
                    return bu0(d.getMilliseconds(), 4);
                }
            },
            f,
            fl,
            b;
        function makeFormats(ff, nn) {
            formats[ff] = function (d) {
                return d[nn]();
            };
        }
        function makeFormatsBu0(ff, fn) {
            formats[ff] = function (d) {
                return bu0(fn(d), 2);
            };
        }
        for (f = 0, fl; f < fnLabels.length; f++) {
            fl = fnLabels[f].split(':');
            makeFormats(fnLabels[f], fnNames[f]);
        }
        for (b = 0; b < bu0Labels.length; b++) {
            makeFormatsBu0(bu0Labels[b], formats[bu0Labels[b].slice(0, -1)]);
        }

        return function (date, options) {
            date = date || new Date();
            options = options || {};
            var format = (typeof options === 'string') ? options : (options.format || defaultFormat);
            // console.log(date,format)
            return format.replace(dateReg, function (mt) {

                var res = formats[mt](date),
                    todo = options[mt] || defaultStrings[mt];
                // console.log(mt,todo)
                return todo ? (typeof todo === 'function' ? todo(res) : todo[res]) : res;
            });
        };
    }());
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
    ui.DateSelect = core.inherits(
        ui.Control,
        '*ui-dateselect',
        function (el, options) {
            ui.Control.constructor.call(this, el, options);
            var wrap = dom.create('datepicker'),
                datebox = dom.create('datepicker-wrap'),
                input_group = dom.create('input-group w8n'),
                input_wrap = dom.create('text-input-wrap'),
                span;
            // wrap.className = 'datepicker-wrap';
            input_group.appendChild(input_wrap);
            wrap.appendChild(input_group);
            datebox.setAttribute('ui', '');
            dom.insertAfter(wrap, el);
            input_wrap.appendChild(el);
            wrap.appendChild(datebox);
            // dom.insertAfter(datebox, el);
            if (options.prefix) {
                span = dom.create('input-title');
                span.innerHTML = options.prefix;
                dom.insertBefore(span, input_wrap);
            }

            // ecui.init(datebox);\
            this.default = options.default && options.default.split('|');
            // console.log(options.format);
            core.$create(this.MonthView, {
                main: datebox,
                format: options.format || 'yyyy-MM-dd'
            }).init();
            // core.init(datebox);
            this.datebox = datebox.getControl();
            this.datebox.Input = this;
            this.datebox.hide();
            // console.log(this.default)
            if (this.default && this.default.length) {
                this.datebox.setDate(new Date(this.default[0], +this.default[1] - 1, this.default[2]));
            }
        },
        {
            MonthView: core.inherits(
                ui.MonthView,
                '',
                function (el, options) {
                    var cal = this,
                        hide = 'ui-hide',
                        tmpEl,
                        tfoot,
                        list,
                        totoday,
                        clear,
                        table,
                        monthes,
                        years;

                    options.extra = 'enable';
                    this.format = options.format;
                    // 当前处于何种状态，默认是month，即显示一月内所有天数的状态；可能是monthes（当前1-12月），years(选年)
                    this.status = 'month';
                    ecui.ui.MonthView.constructor.call(this, el, options);
                    dom.addClass(el, 'datepicker-wrap');
                    var content = dom.create('picker-content');
                    tmpEl = dom.create('picker-header');
                    tmpEl.innerHTML = '<span class="picker-left"><i class="icon-arrow-left"></i></span><span class="picker-now"></span><span class="picker-right"><i class="icon-arrow-right"></i></span>';
                    el.insertBefore(tmpEl, el.firstChild);
                    table = el.lastChild;
                    var tablediv = dom.create('date-content table-div');
                    tablediv.appendChild(table);
                    content.appendChild(tablediv);
                    el.appendChild(content);
                    this.title = dom.children(tmpEl)[1];
                    this.hideOnSelect = options.hideOnSelect === undefined ? true : false;
                    // var tfoot = dom.insertHtml(el.lastChild,'beforeEnd','<tfoot><tr><td>aaa</td></tr></tfoot>');
                    tfoot = dom.create('footbtns');
                    tfoot.innerHTML = '<span style="">今天</span><span style="">清除</span>';
                    tablediv.appendChild(tfoot);
                    var yearsView = content.appendChild(dom.create('date-content yearsView ' + hide));
                    var monthesView = content.appendChild(dom.create('date-content monthesView ' + hide));
                    function showTable() {
                        dom.addClass(yearsView, hide);
                        dom.addClass(monthesView, hide);
                        dom.removeClass(tablediv, hide);
                        var year = cal.getYear(),
                            month = cal.getMonth();
                        cal.title.innerHTML = year + '年' + month + '月';
                        cal.status = 'month';
                    }
                    monthesView.onclick = function (e) {
                        e = core.wrapEvent(e);
                        var target = e.target;
                        if (dom.hasClass(target, 'month-item')) {
                            // console.log('month', target.index);
                            var date = cal.getDate(),
                                year = cal.title.innerHTML.slice(0, -1);
                            date.setYear(+year);
                            date.setMonth(+target.index);
                            cal.setDate(date);
                            showTable();
                        }
                    };
                    monthes = cal.monthes = (function () {
                        var res = [],
                            i = 0,
                            div;
                        for (i = 0; i < 12; i++) {
                            div = dom.create('month-item');
                            div.index = i;
                            div.innerHTML = (i + 1) + '月';
                            res.push(monthesView.appendChild(div));
                        }
                        return res;
                        // el.appendChild(monthesView);
                    }());
                    function showMouthes() {
                        dom.addClass(tablediv, hide);
                        dom.addClass(yearsView, hide);
                        dom.removeClass(monthesView, hide);
                        var year = cal.getYear(),
                            month = cal.getMonth(),
                            m = 0,
                            mm;
                        for (m; m < monthes.length; m++) {
                            mm = monthes[m];
                            if (mm.index === month - 1) {
                                dom.addClass(mm, 'focus');
                            } else {
                                dom.removeClass(mm, 'focus');
                            }
                        }
                        cal.title.innerHTML = year + '年';
                        cal.status = 'monthes';
                    }
                    yearsView.onclick = function (e) {
                        e = core.wrapEvent(e);
                        var target = e.target;
                        if (dom.hasClass(target, 'year-item')) {
                            // console.log('year', target.index);
                            var date = cal.getDate();
                            date.setYear(+target.innerHTML);
                            cal.setDate(date);
                            showMouthes();
                        }
                    };
                    years = cal.years = (function () {
                        var res = [],
                            i = 0,
                            div;
                        for (i = 0; i < 9; i++) {
                            div = dom.create('year-item');
                            div.index = i;
                            res.push(yearsView.appendChild(div));
                        }
                        return res;
                    }());

                    function showYears() {
                        dom.addClass(monthesView, hide);
                        dom.addClass(tablediv, hide);
                        dom.removeClass(yearsView, hide);
                        var year = cal.getYear(),
                            start = year - 4,
                            end = year + 4,
                            i = 0;
                        cal.title.innerHTML = start + '~' + end;
                        for (start; start <= end; start++, i++) {
                            years[i].innerHTML = start;
                            if (start === year) {
                                dom.addClass(years[i], 'focus');
                            }
                        }
                        cal.status = 'years';
                    }

                    list = ecui.dom.children(el.firstChild);
                    list[0].onclick = function () {
                        cal.move(-1);
                    };
                    list[1].onclick = function () {
                        if (cal.status === 'month') {
                            showMouthes();
                        } else if (cal.status === 'monthes') {
                            showYears();
                        } else {
                            showTable();
                        }
                    };
                    list[2].onclick = function () {
                        cal.move(1);
                    };
                    totoday = tfoot.firstChild;
                    clear = tfoot.lastChild;
                    totoday.onclick = function () {
                        cal.toToday();
                    };
                    clear.onclick = function () {
                        cal.hide();
                        cal.setDate('');
                    };

                },
                {
                    move: function (offsetMonth) {
                        var cal = this,
                            year;
                        if (cal.status === 'month') {
                            // time = new Date(this._nYear, this._nMonth + offsetMonth, 1);
                            ui.MonthView.prototype.move.call(this, offsetMonth);
                        } else if (cal.status === 'monthes') {
                            year = +cal.title.innerHTML.slice(0, -1);
                            if (!isNaN(year)) {
                                year += offsetMonth;
                            }
                            cal.title.innerHTML = year + '年';
                        } else {
                            var temp = cal.title.innerHTML.split('~'),
                                start = +temp[0],
                                end = +temp[1],
                                i = 0,
                                years = cal.years;
                            year = cal.getYear();
                            if (offsetMonth < 0) {
                                end = start - 1;
                                start -= 9;
                            } else {
                                start = end + 1;
                                end += 9;
                            }
                            cal.title.innerHTML = start + '~' + end;
                            for (start; start <= end; start++, i++) {
                                years[i].innerHTML = start;
                                if (start === year) {
                                    dom.addClass(years[i], 'focus');
                                } else {
                                    dom.removeClass(years[i], 'focus');
                                }
                            }
                        }

                    },
                    ondateclick: function (event, d) {
                        this.setDate(d, event);
                        if (this.hideOnSelect) {
                            this.hide();
                        }
                        return false;
                    },
                    toToday: function () {
                        var now = new Date();
                        this.setDate(now);
                        this.hide();
                    },
                    setDate: function (date) {
                        ui.MonthView.prototype.setDate.call(this, date || new Date());
                        this.Input._eMain.value = date ? dateFormat(date, this.format) : '';
                    },
                    setView: function (year, month) {
                        ui.MonthView.prototype.setView.call(this, year, month);
                        this.title.innerHTML = this.getYear() + jingoal.workbench.RES.year + this.getMonth() + jingoal.workbench.RES.month;
                    }
                }
            ),
            /**
             * @override
             */
            $click: function () {
                if (this.datebox.isShow()) {
                    this.datebox.hide();
                } else {
                    this.datebox.show();
                }
            }
        }
    );
}());
