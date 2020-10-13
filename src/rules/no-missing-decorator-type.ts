import { createRule } from '../util/createRule';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { getTypeGraphQLVisitors } from '../util/typeGraphQLUtil';

type Options = ['nontrivial' | 'nontrivial-and-number' | 'all'];
type MessageIds = 'missingNonTrivialDecoratorType' | 'missingNumberDecoratorType' | 'missingDecoratorType';

export default createRule<Options, MessageIds>({
  name: 'no-missing-decorator-type',
  meta: {
    docs: {
      description: 'Warns when a decorator is missing a type',
      category: 'Possible Errors',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      missingNonTrivialDecoratorType: 'No type function specified for non-trivial type',
      missingNumberDecoratorType:
        'No type function specified for number type (specify TypeGraphQL `Int` or `Float` type)',
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
    const parserServices = ESLintUtils.getParserServices(context);
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
        decoratedProps.type.isArrayNullable;

      if (isNonTrivial) {
        // Always report missing nontrivial decorator types
        context.report({
          node: decoratorProps.node,
          messageId: 'missingNonTrivialDecoratorType',
        });
      } else if (
        decoratedProps.type.name === 'number' &&
        (strictness === 'all' || strictness === 'nontrivial-and-number')
      ) {
        // Report missing number decorator types based on strictness
        context.report({
          node: decoratorProps.node,
          messageId: 'missingNumberDecoratorType',
        });
      } else if (strictness === 'all') {
        // In most strict mode, report everything
        context.report({
          node: decoratorProps.node,
          messageId: 'missingDecoratorType',
        });
      }
    });
  },
});
