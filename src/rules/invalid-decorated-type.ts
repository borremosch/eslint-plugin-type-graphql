import * as util from '../util';
import { getTypeGraphQLVisitors } from '../util/typeGraphQLUtil';

type Options = [];
type MessageIds = 'invalidDecoratedType';

export default util.createRule<Options, MessageIds>({
  name: 'wrong-decorator-signature',
  meta: {
    docs: {
      description: 'Warns when a TypeGraphQL decorated type is not expressable in GraphQL.',
      category: 'Possible Errors',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      invalidDecoratedType: 'Decorated type is not expressable in GraphQL',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return getTypeGraphQLVisitors(checker, parserServices, ({ decoratorProps, decoratedProps }) => {
      // Check whether the decorated type is too complex
      if (!decoratedProps.type || decoratedProps.type.isValid) {
        return;
      }

      context.report({
        node: decoratorProps.node,
        messageId: 'invalidDecoratedType',
      });
    });
  },
});