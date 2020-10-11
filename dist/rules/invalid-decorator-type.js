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
  name: 'wrong-decorator-signature',
  meta: {
    docs: {
      description: 'Warns when TypeGraphQL decorator is poorly configured.',
      category: 'Possible Errors',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      multiElementArray: 'Type function array may contain only one element',
      invalidTypeFunction: 'Type function is invalid',
      invalidNullableValue: 'Option { nullable: "{{ nullableValue }}" } may only be used on array types',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    return typeGraphQLUtil_1.getTypeGraphQLVisitors(context, checker, parserServices, ({ decoratorProps }) => {
      // Check whether the decorator type is invalid
      if (!decoratorProps.type || decoratorProps.type.isValid) {
        return;
      }
      if (decoratorProps.type.multiElementArray) {
        context.report({
          node: decoratorProps.node,
          messageId: 'multiElementArray',
        });
      } else if (decoratorProps.type.invalidTypeFunction) {
        context.report({
          node: decoratorProps.node,
          messageId: 'invalidTypeFunction',
        });
      } else if (decoratorProps.type.invalidNullableValue) {
        context.report({
          node: decoratorProps.node,
          messageId: 'invalidNullableValue',
          data: {
            nullableValue: decoratorProps.type.invalidNullableValue,
          },
        });
      }
    });
  },
});
//# sourceMappingURL=invalid-decorator-type.js.map
