(function (jingoal, ecui, etpl) {
    'use strict';
    jingoal.ui.personSelectTree = function (callback) {
        if (ecui.get('r_tree')) {
            return ecui.get('r_tree').div;
        }
        var dom = ecui.dom,
            ctx = {},
            rootNode,
            template,
            render,
            el,
            html,
            temp,
            div,
            contactBgColor,
            deptTree,
            onTreeExpand;

        function getParentByClass(el, cls) {
            while (el) {
                if (el.className && dom.hasClass(el, cls)) {
                    return el;
                }
                el = dom.getParent(el);
            }
            return false;
        }
        ctx.CompanyOrg = jingoal.CompanyOrg;
        jingoal.procCompanyOrg(ctx.CompanyOrg);
        rootNode = jingoal.CompanyOrg.org_nodes[0];
        if (!rootNode.hasOwnProperty('total')) {
            (function iterates1(list) {
                var total = 0,
                    number;
                list.forEach(function (node) {
                    if (node.hasOwnProperty('children')) {
                        node.children = node.children || [];
                        number = iterates1(node.children);
                        node.total = (node.total || 0) + number;
                        total += number;
                    } else {
                        total += 1;
                    }
                });
                return total;
            }([rootNode]));
            (function iterates2(dept) {
                var i = 0,
                    l = dept.children.length;
                dept.depts = [];
                dept.users = [];
                for (i; i < l; i += 1) {
                    if (dept.children[i].children) {
                        dept.depts.push(dept.children[i]);
                        iterates2(dept.children[i]);
                    } else {
                        dept.users.push(dept.children[i]);
                    }
                }
            }(rootNode));
        }
        ctx.rootNode = rootNode;
        //模板已经存在就用已经存在的，没有则创建新的
        template = '<ul ui="type:tree-view;id:dept-tree;collapsed:true" class="dept-tree tree-body"> <label data-id="${rootNode.id}" data-loaded="false" title="${rootNode.name}"><span></span>${rootNode.name|preLength(20)}&nbsp;(${rootNode.total})</label> <!-- use: right_tree(dept=${rootNode}) --> </ul> <!-- target:right_tree --> <!-- for: ${dept.users} as ${user}, ${i}--> <li data-id="${user.id}"> <!-- use: right_person(node=${user}) --> </li> <!-- /for --> <!-- for: ${dept.depts} as ${dept}, ${i}--> <ul> <label data-id="${dept.id}" data-loaded="false" title="${dept.name}"><div class="vm"></div><span></span>${dept.name|preLength(30)}&nbsp;(${dept.total})</label> <!-- use: right_tree(dept=${dept}) --> </ul> <!-- /for --> <!-- target:right_person --> <div class="contact-photo"> <img src="${node.photo_url}" class="avatar" data-bgcolor="${node.bgColor}" data-name="${node.name}" width="48px" height="48px" <!-- if: ${node.name} --> onerror="jingoal.userAvatarNotFound(this)"<!-- /if -->/> <span class="contact-name" title="${node.name}">${node.name|preLength(16)}</span> </div>';
        if (etpl.targets.right_tree) {
            template = '<ul ui="type:tree-view;id:dept-tree;collapsed:true" class="dept-tree tree-body"> <label data-id="${rootNode.id}" data-loaded="false" title="${rootNode.name}"><span></span>${rootNode.name|preLength(20)}&nbsp;(${rootNode.total})</label> <!-- use: right_tree(dept=${rootNode}) --> </ul>';
        }
        render = etpl.compile(template);
        html = render(ctx);
        temp = ecui.dom.create('', 'div');
        temp.innerHTML = html;
        el = ecui.dom.create('dept-tree tree-body', 'ul');
        el.setAttribute('ui', 'type:tree-view;id:r_tree;collapsed:true');
        el.innerHTML = ecui.dom.first(temp).innerHTML;
        div = ecui.dom.create('right-select-tree', 'div');
        div.appendChild(el);
        document.body.appendChild(div);
        ecui.dom.addEventListener(el, 'click', function (e) {
            var event = e || window.event,
                target = event.target || event.srcELement,
                targetEl = getParentByClass(target, 'dept-tree-leaf'),
                userId;
            if (targetEl) {
                userId = targetEl.getAttribute('data-id');
            }
            if (targetEl) {
                callback(userId);
            }
        });
        ecui.init(el);
        contactBgColor = ['#66bbff', '#aa99ff', '#aadd55', '#66ccee', '#77aaff', '#ff7766', '#55ddcc', '#66dd99', '#ff9944', '#ff99dd'];
        deptTree = ecui.get('r_tree');
        deptTree.div = div;
        onTreeExpand = function () {
            var baseDom = this.getBody(),
                deptId = baseDom.getAttribute('data-id'),
                loaded = baseDom.getAttribute('data-loaded'),
                contacts = this.getChildren(),
                data,
                items = {};
            if (loaded === 'true') {
                return;
            }
            data = jingoal.CompanyDept[deptId].children;
            data.forEach(function (item) {
                items[item.id] = item;
            });
            contacts.forEach(function (contact, index) {
                var body = contact.getBody(),
                    contactId,
                    concatData;
                if (body.tagName.toLowerCase() === 'li') {
                    contactId = body.getAttribute('data-id');
                    if (items[contactId]) {
                        concatData = items[contactId];
                        concatData.bgColor = contactBgColor[index % 10];
                        if (concatData) {
                            body.innerHTML = etpl.render('right_person', {
                                node: concatData
                            });
                        }
                    }
                }
            });
            baseDom.setAttribute('data-loaded', 'true');
        };
        (function iterates(depts) {
            depts.forEach(function (dept) {
                ecui.addEventListener(dept, 'expand', onTreeExpand);
                iterates(dept.getChildren());
            });
        }([deptTree]));
        deptTree.onclick = function () {
            return false;
        };
        deptTree.expand();
        onTreeExpand.call(deptTree);
        return div;
    };
}(window.jingoal, window.ecui, window.etpl));
