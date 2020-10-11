import * as util from '../util';
import { getTypeGraphQLVisitors } from '../util/typeGraphQLUtil';

type Options = ['nontrivial' | 'nontrivial-and-number' | 'all'];
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

    return getTypeGraphQLVisitors(checker, parserServices, ({ decoratorProps, decoratedProps }) => {
      // Check whether this decorator type is erroneous
      if (!decoratedProps.type?.isValid || decoratorProps.type) {
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
    });
  },
});
