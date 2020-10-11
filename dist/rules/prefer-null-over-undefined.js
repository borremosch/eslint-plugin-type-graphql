'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const util = __importStar(require('../util'));
const typeGraphQLUtil_1 = require('../util/typeGraphQLUtil');
exports.default = util.createRule({
  name: 'prefer-null-over-undefined',
  meta: {
    docs: {
      description: 'Warns when undefined is used in a type that is decorated with a TypeGraphQL decorator',
      category: 'Best Practices',
      recommended: 'warn',
      requiresTypeChecking: true,
    },
    messages: {
      preferNullOverUndefined: 'Prefer null over undefined in types that are exposed in the GraphQL schema',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    return typeGraphQLUtil_1.getTypeGraphQLVisitors(
      context,
      checker,
      parserServices,
      ({ decoratorProps, decoratedProps }) => {
        var _a;
        // Check whether the decorated type is known and valid
        if (!((_a = decoratedProps.type) === null || _a === void 0 ? void 0 : _a.isValid)) {
          return;
        }
        if (decoratedProps.type.isUndefinable || decoratedProps.type.isArrayUndefinable) {
          // This type uses undefined
          context.report({
            node: decoratorProps.node,
            messageId: 'preferNullOverUndefined',
          });
        }
      }
    );
  },
});
//# sourceMappingURL=prefer-null-over-undefined.js.map
