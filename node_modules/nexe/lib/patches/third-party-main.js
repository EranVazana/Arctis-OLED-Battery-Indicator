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
var cherow_1 = require("cherow");
var util_1 = require("../util");
function walkSome(node, visit) {
    if (!node || typeof node.type !== 'string' || node._visited) {
        return false;
    }
    visit(node);
    node._visited = true;
    for (var childNode in node) {
        var child = node[childNode];
        if (Array.isArray(child)) {
            for (var i = 0; i < child.length; i++) {
                if (walkSome(child[i], visit)) {
                    return true;
                }
            }
        }
        else if (walkSome(child, visit)) {
            return true;
        }
    }
    return false;
}
function main(compiler, next) {
    return __awaiter(this, void 0, void 0, function () {
        var bootFile, version, file, ast, location, fileLines;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bootFile = 'lib/internal/bootstrap_node.js';
                    version = compiler.target.version;
                    if (version.startsWith('4.')) {
                        bootFile = 'src/node.js';
                    }
                    else if (util_1.semverGt(version, '11.99')) {
                        bootFile = 'lib/internal/bootstrap/pre_execution.js';
                    }
                    else if (util_1.semverGt(version, '9.10.1')) {
                        bootFile = 'lib/internal/bootstrap/node.js';
                    }
                    return [4 /*yield*/, compiler.readFileAsync(bootFile)];
                case 1:
                    file = _a.sent(), ast = cherow_1.parse(file.contents, {
                        loc: true,
                        tolerant: true,
                        next: true,
                        globalReturn: true,
                        node: true,
                        skipShebang: true
                    }), location = { start: { line: 0 } };
                    walkSome(ast, function (node) {
                        if (!location.start.line && node.type === 'BlockStatement') {
                            //Find the first block statement and mark the location
                            Object.assign(location, node.loc);
                            return true;
                        }
                    });
                    fileLines = file.contents.split('\n');
                    fileLines.splice(location.start.line, 0, "if (true) {\n  const __nexe_patches = (process.nexe = { patches: {} }).patches\n  const slice = [].slice\n  const __nexe_noop_patch = function (original) {\n    const args = slice.call(arguments, 1)\n    return original.apply(this, args)\n  }\n  const __nexe_patch = function (obj, method, patch) {\n    const original = obj[method]\n    if (!original) return\n    __nexe_patches[method] = patch\n    obj[method] = function() {\n      const args = [original].concat(slice.call(arguments))\n      return __nexe_patches[method].apply(this, args)\n    }\n  }\n  __nexe_patch((process).binding('fs'), 'internalModuleReadFile', __nexe_noop_patch)\n  __nexe_patch((process).binding('fs'), 'internalModuleReadJSON', __nexe_noop_patch)\n  __nexe_patch((process).binding('fs'), 'internalModuleStat', __nexe_noop_patch)\n}\n" +
                        '\n' +
                        (util_1.semverGt(version, '11.99') ? 'expandArgv1 = false;\n' : ''));
                    file.contents = fileLines.join('\n');
                    if (!util_1.semverGt(version, '11.99')) return [3 /*break*/, 4];
                    return [4 /*yield*/, compiler.replaceInFileAsync(bootFile, 'initializePolicy();', 'initializePolicy();\n' + util_1.wrap("\"use strict\";\nvar fs = require('fs'), fd = fs.openSync(process.execPath, 'r'), stat = fs.statSync(process.execPath), tailSize = Math.min(stat.size, 16000), tailWindow = Buffer.from(Array(tailSize));\nfs.readSync(fd, tailWindow, 0, tailSize, stat.size - tailSize);\nvar footerPosition = tailWindow.indexOf('<nexe~~sentinel>');\nif (footerPosition == -1) {\n    throw 'Invalid Nexe binary';\n}\nvar footer = tailWindow.slice(footerPosition, footerPosition + 32), contentSize = footer.readDoubleLE(16), resourceSize = footer.readDoubleLE(24), contentStart = stat.size - tailSize + footerPosition - resourceSize - contentSize, resourceStart = contentStart + contentSize;\nObject.defineProperty(process, '__nexe', (function () {\n    var nexeHeader = null;\n    return {\n        get: function () {\n            return nexeHeader;\n        },\n        set: function (value) {\n            if (nexeHeader) {\n                throw new Error('This property is readonly');\n            }\n            nexeHeader = Object.assign({}, value, {\n                blobPath: process.execPath,\n                layout: {\n                    stat: stat,\n                    contentSize: contentSize,\n                    contentStart: contentStart,\n                    resourceSize: resourceSize,\n                    resourceStart: resourceStart\n                }\n            });\n            Object.freeze(nexeHeader);\n        },\n        enumerable: false,\n        configurable: false\n    };\n})());\nvar contentBuffer = Buffer.from(Array(contentSize)), Module = require('module');\nfs.readSync(fd, contentBuffer, 0, contentSize, contentStart);\nfs.closeSync(fd);\nnew Module(process.execPath, null)._compile(contentBuffer.toString(), process.execPath);\n"))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, compiler.replaceInFileAsync('src/node.cc', 'MaybeLocal<Value> StartMainThreadExecution(Environment* env) {', 'MaybeLocal<Value> StartMainThreadExecution(Environment* env) {\n' +
                            '  return StartExecution(env, "internal/main/run_main_module");\n')];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, compiler.setFileContentsAsync('lib/_third_party_main.js', "\"use strict\";\nvar fs = require('fs'), fd = fs.openSync(process.execPath, 'r'), stat = fs.statSync(process.execPath), tailSize = Math.min(stat.size, 16000), tailWindow = Buffer.from(Array(tailSize));\nfs.readSync(fd, tailWindow, 0, tailSize, stat.size - tailSize);\nvar footerPosition = tailWindow.indexOf('<nexe~~sentinel>');\nif (footerPosition == -1) {\n    throw 'Invalid Nexe binary';\n}\nvar footer = tailWindow.slice(footerPosition, footerPosition + 32), contentSize = footer.readDoubleLE(16), resourceSize = footer.readDoubleLE(24), contentStart = stat.size - tailSize + footerPosition - resourceSize - contentSize, resourceStart = contentStart + contentSize;\nObject.defineProperty(process, '__nexe', (function () {\n    var nexeHeader = null;\n    return {\n        get: function () {\n            return nexeHeader;\n        },\n        set: function (value) {\n            if (nexeHeader) {\n                throw new Error('This property is readonly');\n            }\n            nexeHeader = Object.assign({}, value, {\n                blobPath: process.execPath,\n                layout: {\n                    stat: stat,\n                    contentSize: contentSize,\n                    contentStart: contentStart,\n                    resourceSize: resourceSize,\n                    resourceStart: resourceStart\n                }\n            });\n            Object.freeze(nexeHeader);\n        },\n        enumerable: false,\n        configurable: false\n    };\n})());\nvar contentBuffer = Buffer.from(Array(contentSize)), Module = require('module');\nfs.readSync(fd, contentBuffer, 0, contentSize, contentStart);\nfs.closeSync(fd);\nnew Module(process.execPath, null)._compile(contentBuffer.toString(), process.execPath);\n")];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, next()];
            }
        });
    });
}
exports.default = main;
