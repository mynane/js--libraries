var baseFolder, destFolder;
var libFs = require('fs'),
    libOs = require('os'),
    libPath = require('path'),
    libLess = require('less'),
    libCrypto = require('crypto');
var filesToDel = [];

// 遍历文件夹
function travel (folder, callback) {
    var files = libFs.readdirSync(folder);
    files.forEach(function (file) {
        var pathname = libPath.join(folder, file);
        if (!libFs.statSync(pathname).isDirectory()) {
            callback(folder, file);
        }
    });
    files.forEach(function (file) {
        var pathname = libPath.join(folder, file);
        if (libFs.statSync(pathname).isDirectory()) {
            callback(pathname) && travel(pathname, callback);
        }
    });
}
// 生成临时文件名
function genTmpFile (len) {
    var file = libCrypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    return libPath.resolve(libOs.tmpdir(), file);
}
// 拷贝文件
function copyFile (base, dest) {
    var readable = libFs.createReadStream(base);
    var writable = libFs.createWriteStream(dest);
    readable.pipe(writable);
}
// 移动文件
function moveFile (base, dest, callback) {
    libFs.rename(base, dest, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });
    function copy () {
        var readStream = libFs.createReadStream(base);
        var writeStream = libFs.createWriteStream(dest);
        readStream.on('error', callback);
        writeStream.on('error', callback);
        readStream.on('close', function () {
            libFs.unlink(base, callback);
        });
        readStream.pipe(writeStream);
    }
}
// Folder Copy
function processFolderCopy (base, dest) {
    travel(base, function (folder, file) {
        var diff = libPath.relative(base, folder);
        var work = libPath.resolve(dest, diff);
        var name;
        if (file) { // is file
            if ('.' === file[0] || 'WEB-INF' === file) {
                console.log('[LOG]Ignor file: ', libPath.resolve(folder, file));
            } else {
                copyFile(libPath.resolve(folder, file), libPath.resolve(work, file));
            }
        } else {
            // is direction
            name = libPath.basename(folder);
            //if ('.' === name[0] || 'WEB-INF' == name) {
            if ('.' === name[0]) {
                console.log('[LOG]Ignor folder: ' + folder);
                return false;
            } else {
                (!libFs.existsSync(work)) && libFs.mkdirSync(work);
                return true;
            }
        }
        return false;
    });
}

function compileLessFile (file, dest, callback) {
    libFs.readFile(file, {
        encoding: 'utf8'
    }, function (error, data) {
        if (error) throw error;
        libLess.render(data, {
            filename: file
        }).then(function (output) {
            libFs.writeFile(dest, output.css, {
                encoding: 'utf8'
            }, function (error) {
                if (error) throw error;
                console.log('[LOG][CSSLess]', file);
                callback && callback();
            });
        }, function (error) {
            console.log(error);
        });
    });
}

function compileTplFile (file, dest, callback) {
    var spawn, child, file, writable = null;
    var tmpFile = genTmpFile(12);
    // 先遍历，查找需要删除的文件
    libFs.readFile(file, {
        encoding: 'utf8'
    }, function (error, data) {
        var lines;
        if (error) throw error;
        lines = data.split('\n');
        lines.forEach(function (line) {
            var match;
            if (match = line.match(/\/\/{include file="(.+)"}\/\//)) {
                filesToDel.push(libPath.resolve(file, '..', match[1]));
            }
        });
        // 用Smarty4j转换成对应的文件
        spawn = require('child_process').spawn;
        child = spawn('java', ['-jar', libPath.resolve(baseFolder, '../smarty4j.jar'), file, '--left', '//{', '--right', '}//', '-o', tmpFile, '--charset', 'UTF-8']);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        child.on('exit', function (code, signal) {
            moveFile(tmpFile, dest, function (err) {
                console.log('[LOG][Smarty4j]', file);
                callback && callback();
            });
        });
    });
}

function main (argv) {
    baseFolder = argv[0] || '.';
    destFolder = argv[1];
    try {
        processFolderCopy(libPath.resolve(baseFolder, 'src/img'), libPath.resolve(baseFolder, 'dest/img'));
        compileTplFile(libPath.resolve(baseFolder, 'ecui.js'), libPath.resolve(baseFolder, 'dest/ecui.js'), function () {
            compileLessFile(libPath.resolve(baseFolder, 'src/ecui.css'), libPath.resolve(baseFolder, 'dest/ecui.css'));
        });
    } catch (error) {
        console.error(error);
    }
}

main(process.argv.slice(2));