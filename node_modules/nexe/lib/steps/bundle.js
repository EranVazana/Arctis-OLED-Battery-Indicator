"use strict";
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
var compiler_1 = require("../compiler");
var path_1 = require("path");
var semaphore_1 = require("@calebboyd/semaphore");
var resolve_dependencies_1 = require("resolve-dependencies");
var util_1 = require("../util");
function getStdIn(stdin) {
    var out = '';
    return new Promise(function (resolve) {
        stdin
            .setEncoding('utf8')
            .on('readable', function () {
            var current;
            while ((current = stdin.read())) {
                out += current;
            }
        })
            .on('end', function () { return resolve(out.trim()); });
        setTimeout(function () {
            if (!out.trim()) {
                resolve(out.trim());
            }
        }, 1000);
    });
}
function bundle(compiler, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, bundle, cwd, inputPath, input, code, _b, _c, _d, maybeInput, _e, files, warnings;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _a = compiler.options, bundle = _a.bundle, cwd = _a.cwd, inputPath = _a.input;
                    input = inputPath;
                    compiler.entrypoint = './' + path_1.relative(cwd, input);
                    if (util_1.semverGt(compiler.target.version, '11.99')) {
                        compiler.startup = '';
                    }
                    else {
                        compiler.startup = ';require("module").runMain();';
                    }
                    if (!!bundle) return [3 /*break*/, 2];
                    return [4 /*yield*/, compiler.addResource(path_1.resolve(cwd, input))];
                case 1:
                    _f.sent();
                    return [2 /*return*/, next()];
                case 2:
                    code = '';
                    if (!(typeof bundle === 'string')) return [3 /*break*/, 4];
                    return [4 /*yield*/, require(bundle).createBundle(compiler.options)];
                case 3:
                    code = _f.sent();
                    _f.label = 4;
                case 4:
                    _b = input === util_1.STDIN_FLAG;
                    if (!_b) return [3 /*break*/, 7];
                    _c = code;
                    if (_c) return [3 /*break*/, 6];
                    _d = util_1.dequote;
                    return [4 /*yield*/, getStdIn(process.stdin)];
                case 5:
                    _c = _d.apply(void 0, [_f.sent()]);
                    _f.label = 6;
                case 6:
                    _b = (code = _c);
                    _f.label = 7;
                case 7:
                    if (!_b) return [3 /*break*/, 9];
                    compiler.stdinUsed = true;
                    compiler.entrypoint = './__nexe_stdin.js';
                    return [4 /*yield*/, compiler.addResource(path_1.resolve(cwd, compiler.entrypoint), code)];
                case 8:
                    _f.sent();
                    return [2 /*return*/, next()];
                case 9:
                    if (input === util_1.STDIN_FLAG) {
                        maybeInput = resolve_dependencies_1.resolveSync(cwd, '.');
                        if (!maybeInput || !maybeInput.absPath) {
                            throw new compiler_1.NexeError('No valid input detected');
                        }
                        input = maybeInput.absPath;
                        compiler.entrypoint = './' + path_1.relative(cwd, input);
                    }
                    return [4 /*yield*/, resolve_dependencies_1.default.apply(void 0, [input].concat(Object.keys(compiler.bundle.index).filter(function (x) { return x.endsWith('.js'); }), [{ cwd: cwd, expand: 'all', loadContent: false }]))];
                case 10:
                    _e = _f.sent(), files = _e.files, warnings = _e.warnings;
                    if (warnings.filter(function (x) { return x.startsWith('Error parsing file') && !x.includes('node_modules'); }).length) {
                        throw new compiler_1.NexeError('Parsing Error:\n' + warnings.join('\n'));
                    }
                    return [4 /*yield*/, semaphore_1.each(Object.keys(files), function (filename) { return compiler.addResource(filename); }, {
                            concurrency: 10
                        })];
                case 11:
                    _f.sent();
                    return [2 /*return*/, next()];
            }
        });
    });
}
exports.default = bundle;
