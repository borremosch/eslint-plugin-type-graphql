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
  name: 'no-missing-decorator-type',
  meta: {
    docs: {
      description: 'Warns when a decorator is missing a type',
      category: 'Possible Errors',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      missingDecoratorType: 'This decorator does not explicitly specify a type',
    },
    schema: [
      {
        type: 'string',
        enum: ['nontrivial', 'nontrivial-and-number', 'all'],
      },
    ],
    type: 'problem',
  },
  defaultOptions: ['nontrivial-and-number'],
  create(context, [strictness]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    return typeGraphQLUtil_1.getTypeGraphQLVisitors(
      context,
      checker,
      parserServices,
      ({ decoratorProps, decoratedProps }) => {
        var _a;
        // Check whether this decorator type is erroneous
        if (!((_a = decoratedProps.type) === null || _a === void 0 ? void 0 : _a.isValid) || decoratorProps.type) {
          return;
        }
        // Get properties of decorated type
        const isNonTrivial =
          decoratedProps.type.isPromise ||
          decoratedProps.type.isArray ||
          decoratedProps.type.isNullable ||
          decoratedProps.type.isUndefinable;
        const isNumber = decoratedProps.type.name === 'number';
        // Throw error depending on options
        if (isNonTrivial || strictness === 'all' || (strictness === 'nontrivial-and-number' && isNumber)) {
          context.report({
            node: decoratorProps.node,
            messageId: 'missingDecoratorType',
          });
        }
      }
    );
  },
});
//# sourceMappingURL=no-missing-decorator-type.js.map
