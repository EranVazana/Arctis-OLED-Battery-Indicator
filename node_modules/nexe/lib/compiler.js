"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var buffer_1 = require("buffer");
var fs_1 = require("fs");
var child_process_1 = require("child_process");
var logger_1 = require("./logger");
var util_1 = require("./util");
var options_1 = require("./options");
var combineStreams = require("multistream");
var bundle_1 = require("./fs/bundle");
var isBsd = Boolean(~process.platform.indexOf('bsd'));
var make = util_1.isWindows ? 'vcbuild.bat' : isBsd ? 'gmake' : 'make';
var configure = util_1.isWindows ? 'configure' : './configure';
var NexeError = /** @class */ (function (_super) {
    __extends(NexeError, _super);
    function NexeError(m) {
        var _this = _super.call(this, m) || this;
        Object.setPrototypeOf(_this, NexeError.prototype);
        return _this;
    }
    return NexeError;
}(Error));
exports.NexeError = NexeError;
var NexeCompiler = /** @class */ (function () {
    function NexeCompiler(options) {
        this.options = options;
        /**
         * Epoch of when compilation started
         */
        this.start = Date.now();
        this.log = new logger_1.Logger(this.options.loglevel);
        /**
         * Copy of process.env
         */
        this.env = __assign({}, process.env);
        /**
         * In memory files that are being manipulated by the compiler
         */
        this.files = [];
        /**
         * Standalone pieces of code run before the application entrypoint
         */
        this.shims = [];
        /**
         * The last shim (defaults to "require('module').runMain()")
         */
        this.startup = '';
        /**
         * Output filename (-o myapp.exe)
         */
        this.output = this.options.output;
        /**
         * Flag to indicate whether or notstdin was used for input
         */
        this.stdinUsed = false;
        var python = (this.options = options).python;
        //SOMEDAY iterate over multiple targets with `--outDir`
        this.targets = options.targets;
        this.target = this.targets[0];
        if (options.asset && options.asset.startsWith('http')) {
            this.remoteAsset = options.asset;
        }
        else {
            this.remoteAsset =
                'https://github.com/nexe/nexe/releases/download/v3.3.3/' + this.target.toString();
        }
        this.src = path_1.join(this.options.temp, this.target.version);
        this.configureScript = configure + (util_1.semverGt(this.target.version, '10.10.0') ? '.py' : '');
        this.nodeSrcBinPath = util_1.isWindows
            ? path_1.join(this.src, 'Release', 'node.exe')
            : path_1.join(this.src, 'out', 'Release', 'node');
        this.log.step('nexe ' + options_1.version, 'info');
        this.bundle = new bundle_1.Bundle(options);
        if (util_1.isWindows) {
            var originalPath = process.env.PATH;
            delete process.env.PATH;
            this.env = __assign({}, process.env);
            this.env.PATH = python
                ? (this.env.PATH = util_1.dequote(path_1.normalize(python)) + path_1.delimiter + originalPath)
                : originalPath;
            process.env.PATH = originalPath;
        }
        else {
            this.env = __assign({}, process.env);
            python && (this.env.PYTHON = python);
        }
    }
    NexeCompiler.prototype.addResource = function (file, content) {
        return this.bundle.addResource(file, content);
    };
    Object.defineProperty(NexeCompiler.prototype, "binaryConfiguration", {
        get: function () {
            return { resources: this.bundle.index };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NexeCompiler.prototype, "resourceSize", {
        get: function () {
            return this.bundle.blobSize;
        },
        enumerable: true,
        configurable: true
    });
    NexeCompiler.prototype.readFileAsync = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedFile, absPath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.assertBuild();
                        cachedFile = this.files.find(function (x) { return path_1.normalize(x.filename) === path_1.normalize(file); });
                        if (!!cachedFile) return [3 /*break*/, 2];
                        absPath = path_1.join(this.src, file);
                        _a = {
                            absPath: absPath,
                            filename: file
                        };
                        return [4 /*yield*/, util_1.readFileAsync(absPath, 'utf-8').catch(function (x) {
                                if (x.code === 'ENOENT')
                                    return '';
                                throw x;
                            })];
                    case 1:
                        cachedFile = (_a.contents = _b.sent(),
                            _a);
                        this.files.push(cachedFile);
                        _b.label = 2;
                    case 2: return [2 /*return*/, cachedFile];
                }
            });
        });
    };
    NexeCompiler.prototype.writeFileAsync = function (file, contents) {
        this.assertBuild();
        return util_1.writeFileAsync(path_1.join(this.src, file), contents);
    };
    NexeCompiler.prototype.replaceInFileAsync = function (file, replace, value) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readFileAsync(file)];
                    case 1:
                        entry = _a.sent();
                        entry.contents = entry.contents.replace(replace, value);
                        return [2 /*return*/];
                }
            });
        });
    };
    NexeCompiler.prototype.setFileContentsAsync = function (file, contents) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readFileAsync(file)];
                    case 1:
                        entry = _a.sent();
                        entry.contents = contents;
                        return [2 /*return*/];
                }
            });
        });
    };
    NexeCompiler.prototype.quit = function (error) {
        var time = Date.now() - this.start;
        this.log.write("Finished in " + time / 1000 + "s", error ? 'red' : 'green');
        return this.log.flush();
    };
    NexeCompiler.prototype.assertBuild = function () {
        if (!this.options.build) {
            throw new NexeError('This feature is only available with `--build`');
        }
    };
    NexeCompiler.prototype.getNodeExecutableLocation = function (target) {
        if (this.options.asset && !this.options.asset.startsWith('http')) {
            return path_1.resolve(this.options.cwd, this.options.asset);
        }
        if (target) {
            return path_1.join(this.options.temp, target.toString());
        }
        return this.nodeSrcBinPath;
    };
    NexeCompiler.prototype._runBuildCommandAsync = function (command, args) {
        var _this = this;
        if (this.log.verbose) {
            this.compileStep.pause();
        }
        return new Promise(function (resolve, reject) {
            child_process_1.spawn(command, args, {
                cwd: _this.src,
                env: _this.env,
                stdio: _this.log.verbose ? 'inherit' : 'ignore'
            })
                .once('error', function (e) {
                if (_this.log.verbose) {
                    _this.compileStep.resume();
                }
                reject(e);
            })
                .once('close', function (code) {
                if (_this.log.verbose) {
                    _this.compileStep.resume();
                }
                if (code != 0) {
                    var error = command + " " + args.join(' ') + " exited with code: " + code;
                    reject(new NexeError(error));
                }
                resolve();
            });
        });
    };
    NexeCompiler.prototype._configureAsync = function () {
        if (util_1.isWindows && util_1.semverGt(this.target.version, '10.15.99')) {
            return Promise.resolve();
        }
        return this._runBuildCommandAsync(this.env.PYTHON || 'python', [
            this.configureScript
        ].concat(this.options.configure));
    };
    NexeCompiler.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buildOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.compileStep.log("Configuring node build" + (this.options.configure.length ? ': ' + this.options.configure : '...'));
                        return [4 /*yield*/, this._configureAsync()];
                    case 1:
                        _a.sent();
                        buildOptions = this.options.make;
                        this.compileStep.log("Compiling Node" + (buildOptions.length ? ' with arguments: ' + buildOptions : '...'));
                        return [4 /*yield*/, this._runBuildCommandAsync(make, buildOptions)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, fs_1.createReadStream(this.getNodeExecutableLocation())];
                }
            });
        });
    };
    NexeCompiler.prototype._shouldCompileBinaryAsync = function (binary, location) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, snapshot, build, _b, snapshotLastModified, binaryLastModified;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.options, snapshot = _a.snapshot, build = _a.build;
                        if (!binary) {
                            return [2 /*return*/, true];
                        }
                        _b = build && snapshot != null;
                        if (!_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, util_1.pathExistsAsync(snapshot)];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2:
                        if (!_b) return [3 /*break*/, 5];
                        return [4 /*yield*/, util_1.statAsync(snapshot)];
                    case 3:
                        snapshotLastModified = (_c.sent()).mtimeMs;
                        return [4 /*yield*/, util_1.statAsync(location)];
                    case 4:
                        binaryLastModified = (_c.sent()).mtimeMs;
                        return [2 /*return*/, snapshotLastModified > binaryLastModified];
                    case 5: return [2 /*return*/, false];
                }
            });
        });
    };
    NexeCompiler.prototype.compileAsync = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var step, build, location, binary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        step = (this.compileStep = this.log.step('Compiling result'));
                        build = this.options.build;
                        location = this.getNodeExecutableLocation(build ? undefined : target);
                        return [4 /*yield*/, util_1.pathExistsAsync(location)];
                    case 1:
                        binary = (_a.sent()) ? fs_1.createReadStream(location) : null;
                        return [4 /*yield*/, this._shouldCompileBinaryAsync(binary, location)];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.build()];
                    case 3:
                        binary = _a.sent();
                        step.log('Node binary compiled');
                        _a.label = 4;
                    case 4: return [2 /*return*/, this._assembleDeliverable(binary)];
                }
            });
        });
    };
    NexeCompiler.prototype.code = function () {
        return [this.shims.join(''), this.startup].join(';');
    };
    NexeCompiler.prototype._assembleDeliverable = function (binary) {
        if (!this.options.mangle) {
            return binary;
        }
        var startup = this.code(), codeSize = buffer_1.Buffer.byteLength(startup);
        var lengths = buffer_1.Buffer.from(Array(16));
        lengths.writeDoubleLE(codeSize, 0);
        lengths.writeDoubleLE(this.bundle.blobSize, 8);
        return combineStreams([
            binary,
            bundle_1.toStream(startup),
            this.bundle.toStream(),
            bundle_1.toStream(buffer_1.Buffer.concat([buffer_1.Buffer.from('<nexe~~sentinel>'), lengths]))
        ]);
    };
    __decorate([
        util_1.bound
    ], NexeCompiler.prototype, "addResource", null);
    __decorate([
        util_1.bound
    ], NexeCompiler.prototype, "readFileAsync", null);
    __decorate([
        util_1.bound
    ], NexeCompiler.prototype, "writeFileAsync", null);
    __decorate([
        util_1.bound
    ], NexeCompiler.prototype, "replaceInFileAsync", null);
    __decorate([
        util_1.bound
    ], NexeCompiler.prototype, "setFileContentsAsync", null);
    return NexeCompiler;
}());
exports.NexeCompiler = NexeCompiler;
