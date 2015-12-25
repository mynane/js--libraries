/*if (!XMLHttpRequest.prototype.sendAsBinary) {
    XMLHttpRequest.prototype.sendAsBinary = function(sData) {
        var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
        for (var nIdx = 0; nIdx < nBytes; nIdx++) {
            ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
        }
        this.send(ui8Data);
    };
}

jingoal.ui.FileUpload = (function () {
    var finder;
    var queen = [];
    var _findFile = function (name) {
        var i, l = queen.length;
        for (i = 0; i < l; i++) {
            if (queen[i].name === name) {
                return i;
            }
        }
        return -1;
    };
    var _uploadFile = function (item) {
        var xhr = new XMLHttpRequest();
        xhr.open('post', item.url, true);
        xhr.upload.addEventListener('progress', function (e) {
            console.log('progress', e.lengthComputable, e.loaded, e.total);
        }, false);
        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data;
                    try {
                        data = JSON.parse(xhr.responseText);
                    } catch (e) {
                        return;
                    }
                    if ('0' === data.code) {
                        console.log('OK');
                    }
                }
            }
        };
        xhr.upload.addEventListener('load', function (e) {}, false);
        var boundary = "---------------------------" + Date.now().toString(16);
        xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary=" + boundary); // simulate a file MIME POST request.
        xhr.setRequestHeader("Content-Length", item.size);
        var body = '';
        body += "--" + boundary + "\r\n";
        body += "Content-Disposition: form-data; name=\"" + "files\"; filename=\"" + item.name + "\"\r\n";
        body += "Content-Type: "+item.type+"\r\n\r\n";
        body += item + "\r\n";
        body += "--" + boundary + "--\r\n";
        xhr.sendAsBinary(body);
    };
    var requestToken = function (files) {
        var request = [];
        var i, l = files.length;
        for (i = 0; i < l; i++) {
            request.push({
                filename: files[i].name,
                size: files[i].size
            });
        }
        jingoal.ajax('/mgt/rest/commonFile/get_fstokens_create', {
            method: 'post',
            data: {
                "jid": "", // todo: JID可以废弃
                "files": request
            },
            onsuccess: function (response) {
                var i, l, j;
                for (i = 0, l = files.length; i < l; i++) {
                    queen.push(files[i]);
                }
                for (i = 0, l = response.length; i < l; i++) {
                    j = _findFile(response[i].filename);
                    if (j > -1) {
                        queen[j].fsid = response[i].fsid;
                        queen[j].token = response[i].token;
                        queen[j].url = response[i].url;
                        queen[j].state = 0;
                    }
                }
                startUpload();
            }
        });
    };
    var startUpload = function () {
        var i, l = queen.length;
        for (i = 0; i < l; i++) {
            if (0 === queen[i].state) {
                _uploadFile(queen[i]);
            }
        }
    };
    return {
        setFinderArea: function (finder) {
        },
        bindDragEvent: function (el) {
            var handleFiles = function (files) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                }
                requestToken(files);
            }
            document.addEventListener('dragenter', function (e) {
                el.style.borderColor = 'gray';
            }, false);
            document.addEventListener('dragleave', function (e) {
                el.style.borderColor = 'silver';
            }, false);
            el.addEventListener('dragenter', function (e) {
                el.style.borderColor = 'gray';
                el.style.backgroundColor = 'white';
            }, false);
            el.addEventListener('dragleave', function (e) {
                el.style.backgroundColor = 'transparent';
            }, false);
            el.addEventListener('dragenter', function (e) {
                e.stopPropagation();
                e.preventDefault();
            }, false);
            el.addEventListener('dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            }, false);
            el.addEventListener('drop', function (e) {
                e.stopPropagation();
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
            }, false);
        },
        bindFileEvent: function (el) {
            el.addEventListener('click', function (e) {
                this.value = '';
            });
            el.addEventListener('change', function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (this.files.length) {
                    requestToken(this.files);
                }
            });
        }
    };
}());
*/