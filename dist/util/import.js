'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getNameFromCommonJsRequire = void 0;
const types_1 = require('@typescript-eslint/types');
function getNameFromCommonJsRequire(init) {
  var _a, _b, _c, _d;
  if (
    ((_a = init === null || init === void 0 ? void 0 : init.callee) === null || _a === void 0 ? void 0 : _a.name) ===
      'require' &&
    ((_b = init === null || init === void 0 ? void 0 : init.arguments) === null || _b === void 0
      ? void 0
      : _b.length) === 1 &&
    (init === null || init === void 0 ? void 0 : init.arguments[0].type) === types_1.AST_NODE_TYPES.Literal
  ) {
    return (_d = (_c = init.arguments[0].value) === null || _c === void 0 ? void 0 : _c.toString()) !== null &&
      _d !== void 0
      ? _d
      : null;
  }
  return null;
}
exports.getNameFromCommonJsRequire = getNameFromCommonJsRequire;
//# sourceMappingURL=import.js.map
