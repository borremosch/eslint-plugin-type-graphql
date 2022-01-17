import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { createRule } from '../util/createRule';
import { getTypeGraphQLVisitors } from '../util/typeGraphQLUtil';

type Options = [];
type MessageIds = 'multiElementArray' | 'invalidTypeFunction' | 'invalidNullableValue';

export default createRule<Options, MessageIds>({
  name: 'wrong-decorator-signature',
  meta: {
    docs: {
      description: 'Warns when TypeGraphQL decorator is poorly configured.',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      multiElementArray: 'Type function array may contain only one element',
      invalidTypeFunction: 'Type function is invalid',
      invalidNullableValue: 'Option { nullable: "{{ nullableValue }}" } may only be used on array types',
    },
    hasSuggestions: true,
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return getTypeGraphQLVisitors(checker, parserServices, ({ decoratorProps }) => {
      // Check whether the decorator type is invalid
      if (!decoratorProps.type || decoratorProps.type.isValid) {
        return;
      }

      if (decoratorProps.type.multiElementArray) {
        context.report({
          node: decoratorProps.node,
          messageId: 'multiElementArray',
        });
      }
      if (decoratorProps.type.invalidTypeFunction) {
        context.report({
          node: decoratorProps.node,
          messageId: 'invalidTypeFunction',
        });
      }
      if (decoratorProps.type.invalidNullableValue) {
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
