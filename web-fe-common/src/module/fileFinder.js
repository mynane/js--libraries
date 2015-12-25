jingoal.ui.FileFinder = function (el, files) {
    var that = this;
    this.el = el;
    this.queueUpload = []; //上传中的队列
    this.queueStored = []; // 已经上传完的，或者回显的队列
    this.queueDelete = [];// 删除的队列
    files.forEach(function (file) {
        that.addFileStored(file.name, file.size, file.fsid);
    });
    ecui.findControl(el).onclick = function (event) {
        var target = event.target;
        if ('A' === target.tagName) {
            that.addFileDelete(target);
        }
    };
};

jingoal.ui.FileFinder.prototype.addFileUpload = function (name, size, fsid) {
    var div = document.createElement('div');
    div.setAttribute('fsid', )
    div.innerHTML = '<span>' + name + '<span><span>' + size + '</span><a>删除</a>';
    this.el.appendChild(div);
};

jingoal.ui.FileFinder.prototype.addFileStored = function (name, size, fsid) {
    var div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = '<span class="name">' + name + '</span><span class="size">' + size + '</span><a>删除</a>';
    this.el.appendChild(div);
};

jingoal.ui.FileFinder.prototype.addFileDelete = function (dom) {
    this.queueDelete.push(file.id);
};

jingoal.ui.FileFinder.prototype.getFileResult = function () {
    return {
        'upload': this.queueUpload,
        'delete': this.queueDelete
    };
};