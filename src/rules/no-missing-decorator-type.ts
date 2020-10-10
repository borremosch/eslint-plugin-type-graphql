import * as util from '../util';
import { getTypeGraphQLVisitors } from '../util/typeGraphQLUtil';

type Options = [];
type MessageIds = 'missingDecoratorType';

export default util.createRule<Options, MessageIds>({
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
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return getTypeGraphQLVisitors(
      context,
      checker,
      parserServices,
      ({ decoratorNode, decoratorName, decoratorType }) => {
        console.log(decoratorName, !!decoratorType);

        if (!decoratorType) {
          context.report({
            node: decoratorNode,
            messageId: 'missingDecoratorType',
          });
        }
      }
    );
  },
});
