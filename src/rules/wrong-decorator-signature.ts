import { createRule } from '../util/createRule';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import {
  getExpectedTypeGraphQLSignatures,
  getTypeGraphQLDecoratorSignature,
  getTypeGraphQLVisitors,
} from '../util/typeGraphQLUtil';
import { createDisjunction } from '../util/createDisjunction';
import { ValidDecoratedType } from '../util/decoratedValue';

type Options = [{ customTypes?: { [key: string]: string | string[] }; replaceDefaultTypes?: boolean }];
type MessageIds =
  | 'wrongDecoratorType'
  | 'missingDecoratorNullableOption'
  | 'wrongDecoratorNullableOption'
  | 'superfluousDecoratorNullableOption';

export default createRule<Options, MessageIds>({
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
      superfluousDecoratorNullableOption:
        'Decorator options contains superfluous property {{ found }}. Decorated type is not nullable.',
    },
    schema: [
      {
        type: 'object',
        items: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          ],
        },
      },
    ],
    type: 'problem',
  },
  defaultOptions: [{}],
  create(context, options) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return getTypeGraphQLVisitors(checker, parserServices, ({ decoratorProps, decoratedProps }) => {
      // Check that both the decorator and decorated type are known
      if (!decoratorProps.type?.isValid || !decoratedProps.type?.isValid) {
        return;
      }

      const expected = getExpectedTypeGraphQLSignatures(
        decoratedProps.type,
        getAllowedTypes(options, decoratedProps.type)
      );
      const found = getTypeGraphQLDecoratorSignature(decoratorProps.type);

      if (
        !expected.typeFunctions.includes(found.typeFunction) &&
        !(found.originalTypeFunction && expected.typeFunctions.includes(found.originalTypeFunction))
      ) {
        context.report({
          node: decoratorProps.node,
          messageId: 'wrongDecoratorType',
          data: {
            expected: createDisjunction(expected.typeFunctions),
            found: found.typeFunction,
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

const EXPECTED_TYPE_NAME_MAP: { [key: string]: string[] } = {
  number: ['Int', 'Float', 'ID'],
  string: ['String', 'ID'],
  boolean: ['Boolean'],
  Date: ['Date', 'String'],
};

function getAllowedTypes(options: Readonly<Options>, decoratedType: ValidDecoratedType): string[] {
  const defaultTypes = EXPECTED_TYPE_NAME_MAP[decoratedType.name] || [decoratedType.name];
  const possibleCustomTypes = options[0].customTypes?.[decoratedType.name];
  const customTypes = Array.isArray(possibleCustomTypes)
    ? possibleCustomTypes
    : typeof possibleCustomTypes === 'string'
    ? [possibleCustomTypes]
    : [];

  return [...(options[0].replaceDefaultTypes ? [] : defaultTypes), ...customTypes];
}
