jingoal.ui.selectEmployee = (function () {
    var dialog;
    //var usersByDept, usersByAlpha, usersByDuty;
    //var depts, duties;
    var init = function () {
        var usersByDept = jingoal.CompanyOrg.org_nodes[0];
        // 处理人员
        (function iterates(dept) {
            var i = 0, l = dept.children.length;
            dept.depts = [];
            dept.users = [];
            for (; i < l; i++) {
                if (dept.children[i].children) {
                    dept.depts.push(dept.children[i]);
                    iterates(dept.children[i]);
                } else {
                    dept.users.push(dept.children[i]);
                }
            }
            //delete dept.children;
        }(usersByDept));
        // 处理dialog
        dialog = ecui.create(ecui.ui.Dialog, {
            main: ecui.dom.create('ui-selectemployee'),
            hide: true,
            parent: document.body
        });
        dialog.hide();
        dialog.setTitle('添加联系人');
        dialog.getBody().innerHTML = etpl.render('select-employee', {
            usersByDept: usersByDept
        });
        ecui.init(dialog.getBody());
        // 人员树的相关方法
        var setCheckboxRelation = function (dept) {
            var subject = getCheckboxFromTree(dept);
            dept.getChildren().forEach(function (child) {
                getCheckboxFromTree(child).setSubject(subject);
                setCheckboxRelation(child);
            });
        };
        var parseCheckbox = function (checkbox) {
            var item = checkbox.getValue().split('_');
            return {
                type: item[0],
                id: parseInt(item[1], 10)
            };
        };
        var getCheckboxFromTree = function (tree) {
            return ecui.findControl(tree.getBody().getElementsByTagName('input')[0]);
        };
        var setDeptAllUsers = function (dept, checked) {
            dept.getChildren().forEach(function (child) {
                if (child.getChildren().length) {
                    setDeptAllUsers(child, checked);
                } else {
                    var checkbox = getCheckboxFromTree(child);
                    var v = parseCheckbox(checkbox);
                    if (undefined === checked) {
                        if (checkbox.isChecked()) {
                            resultAdd('user-' + v.id, jingoal.CompanyUser[v.id].name);
                        } else {
                            resultDel('user-' + v.id);
                        }
                    } else {
                        if (checked) {
                            resultAdd('user-' + v.id, jingoal.CompanyUser[v.id].name);
                        } else {
                            resultDel('user-' + v.id);
                        }
                    }
                }
            });
        };
        var setDeptAllDepts = function (dept, checked) {
            dept.getChildren().forEach(function (child) {
                if (child.getChildren().length) {
                    setDeptAllDepts(child, checked);
                } else {
                    var checkbox = getCheckboxFromTree(child);
                    var v = parseCheckbox(checkbox);
                    if (undefined === checked) {
                        if (checkbox.isChecked()) {
                            resultAdd('dept-' + v.id, jingoal.CompanyDept[v.id].name);
                        } else {
                            resultDel('dept-' + v.id);
                        }
                    } else {
                        if (checked) {
                            resultAdd('dept-' + v.id, jingoal.CompanyDept[v.id].name);
                        } else {
                            resultDel('dept-' + v.id);
                        }
                    }
                }
            });
        };
        // 设置人员树和checkbox的父子关系
        ecui.get('select-employee-userTreeByDept').expand();
        setCheckboxRelation(ecui.get('select-employee-userTreeByDept'));
        // 设置点击checkbox后的效果,给所有的checkbox绑定事件
        var setUserTreeChecked = function (event) {
            var v, type, id;
            if (!event) {
                return;
            }
            if (event.target === this.getBody()) {
                v = parseCheckbox(this);
                type = v.type;
                id = v.id;
                if ('dept' ===  type && id === usersByDept.id) {
                    // 如果选择的是总公司
                    if (this.isChecked()) {
                        resultCls();
                        resultAdd('corp-0', '全体员工');
                    } else {
                        resultCls();
                    }
                } else if ('dept' === type) {
                    // 普通部门
                    var tree = ecui.findControl(event.target.parentNode);
                    if (!this.isChecked() && resultHas('corp-0')) {
                        setDeptAllUsers(ecui.get('select-employee-userTreeByDept'));
                    } else {
                        setDeptAllUsers(tree, this.isChecked());
                    }
                } else {
                    // 普通用户
                    if (this.isChecked()) {
                        resultAdd('user-' + id, jingoal.CompanyUser[id].name);
                    } else {
                        if (resultHas('user-' + id)) {
                            resultDel('user-' + id);
                        } else if (resultHas('corp-0')) {
                            setDeptAllUsers(ecui.get('select-employee-userTreeByDept'));
                        }
                    }
                }
            }
        };
        (function iterates(dept) {
            var checkbox = getCheckboxFromTree(dept);
            checkbox.onchange = setUserTreeChecked;
            dept.getChildren().forEach(function (child) {
                iterates(child);
            });
        }(ecui.get('select-employee-userTreeByDept')));
        // 设置部门树和checkbox的父子关系
        ecui.get('select-employee-deptTree').expand();
        setCheckboxRelation(ecui.get('select-employee-deptTree'));
        // 设置点击checkbox后的效果
        var setDeptTreeChecked = function (event) {
            var v, id;
            if (!event) {
                return;
            }
            if (event.target === this.getBody()) {
                v = parseCheckbox(this);
                id = v.id;
                if (id === usersByDept.id) {
                    // 如果选择的是总公司
                    if (this.isChecked()) {
                        resultCls();
                        resultAdd('corp-0', '全体员工');
                    } else {
                        resultCls();
                    }
                } else {
                    // 普通部门
                    if (this.isChecked()) {
                        resultAdd('dept-' + id, jingoal.CompanyDept[id].name);
                    } else {
                        if (resultHas('dept-' + id)) {
                            resultDel('dept-' + id);
                        } else if (resultHas('corp-0')) {
                            setDeptAllDepts(ecui.get('select-employee-userTreeByDept'));
                        }
                    }
                }
            }
        };
        //给所有的checkbox绑定事件
        (function iterates(dept) {
            var checkbox = getCheckboxFromTree(dept);
            checkbox.onchange = setDeptTreeChecked;
            dept.getChildren().forEach(function (child) {
                iterates(child);
            });
        }(ecui.get('select-employee-deptTree')));
    };
    // 处理结果集
    var results = {};
    var _resultCnt = function () {
        var head = ecui.get('select-employee-result-head'),
            body = ecui.get('select-employee-result-body');
        head.getBody().getElementsByTagName('span')[0].innerHTML = ecui.dom.children(body.getBody()).length;
    };
    var resultCls = function () {
        results = {};
        var base = ecui.get('select-employee-result-body');
        base.getBody().innerHTML = '';
    };
    var resultHas = function (id) {
        return results[id];
    };
    var resultAdd = function (id, name) {
        var base = ecui.get('select-employee-result-body');
        var item = document.createElement('div');
        if (results[id]) {
            return;
        }
        item.innerHTML = ['<li class="already-choose-item person-item" data-id="' + id + '" ui="type:control">',
            '<span class="mid-helper"></span>',
            //'<img src="../style/img/demo1.jpg" class="mid-icon icon-person">',
            '<span class="mid-text">' + name + '</span>',
            '</li>'].join('');
        item = ecui.dom.first(item);
        ecui.init(item);
        base.getBody().appendChild(item);
        results[id] = name;
        _resultCnt();
    };
    var resultDel = function (id) {
        var base = ecui.get('select-employee-result-body');
        delete results[id];
        ecui.dom.children(base.getBody()).forEach(function (div) {
            if (div.getAttribute('data-id') === id) {
                ecui.findControl(div).dispose();
                ecui.dom.remove(div);
            }
        });
        _resultCnt();
    };
    var resultGet = function () {
        var t = {
            deptIds: [],
            userIds: []
        }, k;
        for (var i in results) {
            if (results.hasOwnProperty(i)) {
                k = i.split('-');
                switch (k[0]) {
                case 'corp':
                    t.cid = -1;
                    break;
                case 'dept':
                    t.deptIds.push(parseInt(k[1], 10));
                    break;
                default:
                    t.userIds.push(parseInt(k[1], 10));
                }
            }
        }
        return t;
    };
    return function (value, options, callback) {
        if (!dialog) {
            init();
            // 提交事件
            ecui.get('select-employee-submit').onclick = function () {
                dialog.hide();
                callback(resultGet());
            };
            ecui.get('select-employee-cancle').onclick = function () {
                dialog.hide();
            };
        }
        // todo：回填数据
        if (value) {
            var userTreeByDept = ecui.get('select-employee-userTreeByDept');
            var deptTree = ecui.get('select-employee-deptTree');
            ecui.findControl(userTreeByDept.getBody().getElementsByTagName('input')[0]).setChecked(false);
            ecui.findControl(deptTree.getBody().getElementsByTagName('input')[0]).setChecked(false);
            resultCls();
            if (value.cid === -1) {
                resultAdd('corp-0', '全体员工');
            } else {
                value.deptIds.forEach(function (dept) {
                    resultAdd('dept-' + dept, jingoal.CompanyDept[dept].name);
                });
                value.userIds.forEach(function (user) {
                    resultAdd('user-' + user, jingoal.CompanyUser[user].name);
                });
            }
        }
        return {
            show: function () {
                dialog.showModal();
            }
        };
    };
}());