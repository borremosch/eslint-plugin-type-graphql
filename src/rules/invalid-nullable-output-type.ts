import { createRule } from '../util/createRule';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { getTypeGraphQLVisitors } from '../util/typeGraphQLUtil';

type Options = [];
type MessageIds = 'invalidNullableOutputType';

export default createRule<Options, MessageIds>({
  name: 'invalid-nullable-output-type',
  meta: {
    docs: {
      description: 'Warns when the nullable type of an output type is invalid',
      category: 'Best Practices',
      recommended: 'warn',
      requiresTypeChecking: true,
    },
    messages: {
      invalidNullableOutputType: 'Nullable output types should be defined as Type | null',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return getTypeGraphQLVisitors(checker, parserServices, ({ decoratorProps, decoratedProps }) => {
      // Check whether the decorator and decorated type area known and valid, and whether this is an input
      if (!decoratedProps.type?.isValid || !decoratorProps.type?.isValid || decoratorProps.direction !== 'output') {
        return;
      }

      // Check whether isArray is set similar for the decorator and decorated type
      if (decoratorProps.type.isArray !== decoratedProps.type.isArray) {
        return;
      }

      if (
        (decoratorProps.type.isArrayNullable &&
          (decoratedProps.type.isArrayUndefinable || !decoratedProps.type.isArrayNullable)) ||
        (decoratorProps.type.isNullable && (decoratedProps.type.isUndefinable || !decoratedProps.type.isNullable))
      ) {
        // This type is either not nullable or undefinable
        context.report({
          node: decoratedProps.typeNode ?? decoratedProps.node,
          messageId: 'invalidNullableOutputType',
        });
      }
    });
  },
});
