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
      description:
        'Warns when the type in the TypeGraphQL decorator is incompatible with the corresponding TypeScript type.',
      category: 'Possible Errors',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      wrongDecoratorType:
        'Decorator type does not match corresponding TypeScript type. Expected {{ expected }} but found {{ found }}.',
      missingDecoratorNullableOption: 'Decorator options should include {{ expected }}.',
      wrongDecoratorNullableOption: 'Decorator options should specify {{ expected }} but found {{ found }}.',
      superfluousDecoratorNullableOption: 'Decorator options contains superfluous property {{ found }}.',
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
        var _a, _b;
        // Check that both the decorator and decorated type are known
        if (
          !((_a = decoratorProps.type) === null || _a === void 0 ? void 0 : _a.isValid) ||
          !((_b = decoratedProps.type) === null || _b === void 0 ? void 0 : _b.isValid)
        ) {
          return;
        }
        const expected = typeGraphQLUtil_1.getExpectedTypeGraphQLSignatures(decoratedProps.type);
        const found = typeGraphQLUtil_1.getTypeGraphQLDecoratorSignature(decoratorProps.type);
        if (!expected.typeFunctions.includes(found.typeFunction)) {
          context.report({
            node: decoratorProps.node,
            messageId: 'wrongDecoratorType',
            data: {
              expected: expected.typeFunctions.join(' or '),
              found,
            },
          });
        }
        if (expected.nullableOption !== found.nullableOption) {
          if (expected.nullableOption && found.nullableOption) {
            context.report({
              node: decoratorProps.node,
              messageId: 'wrongDecoratorNullableOption',
              data: {
                expected: expected.nullableOption,
                found: found.nullableOption,
              },
            });
          } else if (expected.nullableOption) {
            context.report({
              node: decoratorProps.node,
              messageId: 'missingDecoratorNullableOption',
              data: {
                expected: expected.nullableOption,
              },
            });
          } else {
            context.report({
              node: decoratorProps.node,
              messageId: 'superfluousDecoratorNullableOption',
              data: {
                found: found.nullableOption,
              },
            });
          }
        }
      }
    );
  },
});
//# sourceMappingURL=wrong-decorator-signature.js.map
