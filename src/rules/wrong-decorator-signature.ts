import * as util from '../util';
import {
  getExpectedTypeGraphQLSignatures,
  getTypeGraphQLDecoratorSignature,
  getTypeGraphQLVisitors,
} from '../util/typeGraphQLUtil';

type Options = [];
type MessageIds =
  | 'wrongDecoratorType'
  | 'missingDecoratorNullableOption'
  | 'wrongDecoratorNullableOption'
  | 'superfluousDecoratorNullableOption';

export default util.createRule<Options, MessageIds>({
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

    return getTypeGraphQLVisitors(context, checker, parserServices, ({ decoratorProps, decoratedProps }) => {
      // Check that both the decorator and decorated type are known
      if (!decoratorProps.type?.isValid || !decoratedProps.type) {
        return;
      }

      const expected = getExpectedTypeGraphQLSignatures(decoratedProps.type);
      const found = getTypeGraphQLDecoratorSignature(decoratorProps.type);

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
    });
  },
});
