import { createRule } from '../util/createRule';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { getTypeGraphQLVisitors } from '../util/typeGraphQLUtil';

type Options = [];
type MessageIds = 'preferNullOverUndefined';

export default createRule<Options, MessageIds>({
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
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return getTypeGraphQLVisitors(checker, parserServices, ({ decoratorProps, decoratedProps }) => {
      // Check whether the decorated type is known and valid
      if (!decoratedProps.type?.isValid) {
        return;
      }

      if (decoratedProps.type.isUndefinable || decoratedProps.type.isArrayUndefinable) {
        // This type uses undefined
        context.report({
          node: decoratorProps.node,
          messageId: 'preferNullOverUndefined',
        });
      }
    });
  },
});
