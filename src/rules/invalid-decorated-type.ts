import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { createRule } from '../util/createRule';
import { InvalidDecoratedType } from '../util/decoratedValue';
import { getTypeGraphQLVisitors } from '../util/typeGraphQLUtil';

type Options = [];
type MessageIds = 'invalidDecoratedType' | 'unionType';

export default createRule<Options, MessageIds>({
  name: 'wrong-decorator-signature',
  meta: {
    docs: {
      description: 'Warns when a TypeGraphQL decorated type is not expressable in GraphQL.',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      invalidDecoratedType: 'Decorated type is not expressable in GraphQL',
      unionType:
        "Unexpected decorated union type. Use TypeGraphQL's `createUnionType` to create your union in combination with `typeof MyUnionType` as a type annotation",
    },
    hasSuggestions: true,
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return getTypeGraphQLVisitors(checker, parserServices, ({ decoratedProps }) => {
      // Check whether the decorated type is too complex
      if (!decoratedProps.type || decoratedProps.type.isValid) {
        return;
      }

      if ((decoratedProps.type as InvalidDecoratedType).unionType) {
        context.report({
          node: decoratedProps.typeNode ?? decoratedProps.node,
          messageId: 'unionType',
        });
      } else {
        context.report({
          node: decoratedProps.typeNode ?? decoratedProps.node,
          messageId: 'invalidDecoratedType',
        });
      }
    });
  },
});
