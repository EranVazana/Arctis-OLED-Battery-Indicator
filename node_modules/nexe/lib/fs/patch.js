"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var originalFsMethods = null;
var lazyRestoreFs = function () { };
function shimFs(binary, fs) {
    if (fs === void 0) { fs = require('fs'); }
    if (originalFsMethods !== null) {
        return;
    }
    originalFsMethods = Object.assign({}, fs);
    var blobPath = binary.blobPath, manifest = binary.resources, _a = binary.layout, resourceStart = _a.resourceStart, stat = _a.stat, directories = {}, notAFile = '!@#$%^&*', isWin = process.platform.startsWith('win'), isString = function (x) { return typeof x === 'string' || x instanceof String; }, noop = function () { }, path = require('path'), baseDir = path.dirname(process.execPath);
    var log = function (_) { return true; };
    if ((process.env.DEBUG || '').toLowerCase().includes('nexe:require')) {
        log = function (text) { return process.stderr.write('[nexe] - ' + text + '\n'); };
    }
    var winPath = function (key) {
        if (isWin && key.substr(1, 2) === ':\\') {
            key = key[0].toUpperCase() + key.substr(1);
        }
        return key;
    };
    var getKey = function getKey(filepath) {
        if (Buffer.isBuffer(filepath)) {
            filepath = filepath.toString();
        }
        if (!isString(filepath)) {
            return notAFile;
        }
        var key = path.resolve(baseDir, filepath);
        return winPath(key);
    };
    var statTime = function () {
        return {
            dev: 0,
            ino: 0,
            nlink: 0,
            rdev: 0,
            uid: 123,
            gid: 500,
            blksize: 4096,
            blocks: 0,
            atime: new Date(stat.atime),
            atimeMs: stat.atime.getTime(),
            mtime: new Date(stat.mtime),
            mtimeMs: stat.mtime.getTime(),
            ctime: new Date(stat.ctime),
            ctimMs: stat.ctime.getTime(),
            birthtime: new Date(stat.birthtime),
            birthtimeMs: stat.birthtime.getTime()
        };
    };
    var createStat = function (extensions) {
        return Object.assign(new fs.Stats(), binary.layout.stat, statTime(), extensions);
    };
    var ownStat = function (filepath) {
        setupManifest();
        var key = getKey(filepath);
        if (directories[key]) {
            var mode = binary.layout.stat.mode;
            mode |= fs.constants.S_IFDIR;
            mode &= ~fs.constants.S_IFREG;
            return createStat({ mode: mode, size: 0 });
        }
        if (manifest[key]) {
            return createStat({ size: manifest[key][1] });
        }
    };
    function makeLong(filepath) {
        return path._makeLong && path._makeLong(filepath);
    }
    function fileOpts(options) {
        return !options ? {} : isString(options) ? { encoding: options } : options;
    }
    var setupManifest = function () {
        Object.keys(manifest).forEach(function (filepath) {
            var entry = manifest[filepath];
            var absolutePath = getKey(filepath);
            var longPath = makeLong(absolutePath);
            var normalizedPath = winPath(path.normalize(filepath));
            if (!manifest[absolutePath]) {
                manifest[absolutePath] = entry;
            }
            if (longPath && !manifest[longPath]) {
                manifest[longPath] = entry;
            }
            if (!manifest[normalizedPath]) {
                manifest[normalizedPath] = manifest[filepath];
            }
            var currentDir = path.dirname(absolutePath);
            var prevDir = absolutePath;
            while (currentDir !== prevDir) {
                directories[currentDir] = directories[currentDir] || {};
                directories[currentDir][path.basename(prevDir)] = true;
                var longDir = makeLong(currentDir);
                if (longDir && !directories[longDir]) {
                    directories[longDir] = directories[currentDir];
                }
                prevDir = currentDir;
                currentDir = path.dirname(currentDir);
            }
        });
        manifest[notAFile] = false;
        directories[notAFile] = false;
        setupManifest = noop;
    };
    //naive patches intended to work for most use cases
    var nfs = {
        existsSync: function existsSync(filepath) {
            setupManifest();
            var key = getKey(filepath);
            if (manifest[key] || directories[key]) {
                return true;
            }
            return originalFsMethods.existsSync.apply(fs, arguments);
        },
        realpath: function realpath(filepath, options, cb) {
            setupManifest();
            var key = getKey(filepath);
            if (isString(filepath) && (manifest[filepath] || manifest[key])) {
                return process.nextTick(function () { return cb(null, filepath); });
            }
            return originalFsMethods.realpath.call(fs, filepath, options, cb);
        },
        realpathSync: function realpathSync(filepath, options) {
            setupManifest();
            var key = getKey(filepath);
            if (manifest[key]) {
                return filepath;
            }
            return originalFsMethods.realpathSync.call(fs, filepath, options);
        },
        readdir: function readdir(filepath, options, callback) {
            setupManifest();
            var dir = directories[getKey(filepath)];
            if (dir) {
                if ('function' === typeof options) {
                    callback = options;
                    options = { encoding: 'utf8' };
                }
                process.nextTick(function () { return callback(null, Object.keys(dir)); });
            }
            else {
                return originalFsMethods.readdir.apply(fs, arguments);
            }
        },
        readdirSync: function readdirSync(filepath, options) {
            setupManifest();
            var dir = directories[getKey(filepath)];
            if (dir) {
                return Object.keys(dir);
            }
            return originalFsMethods.readdirSync.apply(fs, arguments);
        },
        readFile: function readFile(filepath, options, callback) {
            setupManifest();
            var entry = manifest[getKey(filepath)];
            if (!entry) {
                return originalFsMethods.readFile.apply(fs, arguments);
            }
            var offset = entry[0], length = entry[1];
            var resourceOffset = resourceStart + offset;
            var encoding = fileOpts(options).encoding;
            callback = typeof options === 'function' ? options : callback;
            originalFsMethods.open(blobPath, 'r', function (err, fd) {
                if (err)
                    return callback(err, null);
                originalFsMethods.read(fd, Buffer.alloc(length), 0, length, resourceOffset, function (error, bytesRead, result) {
                    if (error) {
                        return originalFsMethods.close(fd, function () {
                            callback(error, null);
                        });
                    }
                    originalFsMethods.close(fd, function (err) {
                        if (err) {
                            return callback(err, result);
                        }
                        callback(err, encoding ? result.toString(encoding) : result);
                    });
                });
            });
        },
        createReadStream: function createReadStream(filepath, options) {
            setupManifest();
            var entry = manifest[getKey(filepath)];
            if (!entry) {
                return originalFsMethods.createReadStream.apply(fs, arguments);
            }
            var offset = entry[0], length = entry[1];
            var resourceOffset = resourceStart + offset;
            var opts = fileOpts(options);
            return originalFsMethods.createReadStream(blobPath, Object.assign({}, opts, {
                start: resourceOffset,
                end: resourceOffset + length - 1
            }));
        },
        readFileSync: function readFileSync(filepath, options) {
            setupManifest();
            var entry = manifest[getKey(filepath)];
            if (!entry) {
                return originalFsMethods.readFileSync.apply(fs, arguments);
            }
            var offset = entry[0], length = entry[1];
            var resourceOffset = resourceStart + offset;
            var encoding = fileOpts(options).encoding;
            var fd = originalFsMethods.openSync(process.execPath, 'r');
            var result = Buffer.alloc(length);
            originalFsMethods.readSync(fd, result, 0, length, resourceOffset);
            originalFsMethods.closeSync(fd);
            return encoding ? result.toString(encoding) : result;
        },
        statSync: function statSync(filepath) {
            var stat = ownStat(filepath);
            if (stat) {
                return stat;
            }
            return originalFsMethods.statSync.apply(fs, arguments);
        },
        stat: function stat(filepath, callback) {
            var stat = ownStat(filepath);
            if (stat) {
                process.nextTick(function () {
                    callback(null, stat);
                });
            }
            else {
                return originalFsMethods.stat.apply(fs, arguments);
            }
        }
    };
    if (typeof fs.exists === 'function') {
        nfs.exists = function (filepath, cb) {
            cb = cb || noop;
            var exists = nfs.existsSync(filepath);
            process.nextTick(function () { return cb(exists); });
        };
    }
    var patches = process.nexe.patches || {};
    delete process.nexe;
    patches.internalModuleReadFile = function (original) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var filepath = args[0];
        setupManifest();
        if (manifest[filepath]) {
            log('read     (hit)              ' + filepath);
            return nfs.readFileSync(filepath, 'utf-8');
        }
        log('read          (miss)       ' + filepath);
        return original.call.apply(original, [this].concat(args));
    };
    patches.internalModuleReadJSON = patches.internalModuleReadFile;
    patches.internalModuleStat = function (original) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        setupManifest();
        var filepath = args[0];
        if (manifest[filepath]) {
            log('stat     (hit)              ' + filepath + '   ' + 0);
            return 0;
        }
        if (directories[filepath]) {
            log('stat dir (hit)              ' + filepath + '   ' + 1);
            return 1;
        }
        var res = original.call.apply(original, [this].concat(args));
        if (res === 0) {
            log('stat          (miss)        ' + filepath + '   ' + res);
        }
        else if (res === 1) {
            log('stat dir      (miss)        ' + filepath + '   ' + res);
        }
        else {
            log('stat                 (fail) ' + filepath + '   ' + res);
        }
        return res;
    };
    if (typeof fs.exists === 'function') {
        nfs.exists = function (filepath, cb) {
            cb = cb || noop;
            var exists = nfs.existsSync(filepath);
            if (!exists) {
                return originalFsMethods.exists(filepath, cb);
            }
            process.nextTick(function () { return cb(exists); });
        };
    }
    if (typeof fs.copyFile === 'function') {
        nfs.copyFile = function (filepath, dest, flags, callback) {
            setupManifest();
            var entry = manifest[getKey(filepath)];
            if (!entry) {
                return originalFsMethods.copyFile.apply(fs, arguments);
            }
            if (typeof flags === 'function') {
                callback = flags;
                flags = 0;
            }
            nfs.readFile(filepath, function (err, buffer) {
                if (err) {
                    return callback(err);
                }
                originalFsMethods.writeFile(dest, buffer, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        };
        nfs.copyFileSync = function (filepath, dest) {
            setupManifest();
            var entry = manifest[getKey(filepath)];
            if (!entry) {
                return originalFsMethods.copyFileSync.apply(fs, arguments);
            }
            return originalFsMethods.writeFileSync(dest, nfs.readFileSync(filepath));
        };
    }
    Object.assign(fs, nfs);
    lazyRestoreFs = function () {
        Object.keys(nfs).forEach(function (key) {
            fs[key] = originalFsMethods[key];
        });
        lazyRestoreFs = function () { };
    };
    return true;
}
exports.shimFs = shimFs;
function restoreFs() {
    lazyRestoreFs();
}
exports.restoreFs = restoreFs;
