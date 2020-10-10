import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';
import { TypeGraphQLContext } from './TypeGraphQLContext';
import { NullableListOptions } from 'type-graphql/dist/decorators/types';

const OPERATION_DECORATORS: string[] = ['Mutation', 'Query', 'Subscription'];
const ARG_DECORATOR = 'Arg';
const ARGS_DECORATOR = 'Args';
const FIELD_DECORATOR = 'Field';
const ALL_DECORATORS = [...OPERATION_DECORATORS, ARG_DECORATOR, ARGS_DECORATOR, FIELD_DECORATOR];

export function decoratorHasName(decoratorName: string): boolean {
  return decoratorName === ARG_DECORATOR;
}

export interface DecoratorProps {
  name: string;
  type: DecoratorType | null | undefined;
  node: TSESTree.Decorator;
}

export type DecoratorType = ValidDecoratorType | InvalidDecoratorType;

interface ValidDecoratorType {
  isValid: true;
  typeName: string;
  isNullable?: boolean;
  isArray?: boolean;
  isArrayNullable?: boolean;
}

interface InvalidDecoratorType {
  isValid: false;
}

interface GetDecoratorTypeProps<TMessageIds extends string, TOptions extends readonly unknown[]> {
  node: TSESTree.Decorator;
  typeGraphQLContext: TypeGraphQLContext<TMessageIds, TOptions>;
}
export function getDecoratorProps<TMessageIds extends string, TOptions extends readonly unknown[]>({
  node,
  typeGraphQLContext,
}: GetDecoratorTypeProps<TMessageIds, TOptions>): DecoratorProps | null {
  const name = typeGraphQLContext.getImportedName((node.expression as TSESTree.CallExpression).callee);
  if (!name || !ALL_DECORATORS.includes(name)) {
    // This is now a known TypeGraphQL decorator
    return null;
  }

  return {
    name: name,
    type: getDecoratorType(name, node, typeGraphQLContext),
    node,
  };
}

function getDecoratorType<TMessageIds extends string, TOptions extends readonly unknown[]>(
  decoratorName: string,
  node: TSESTree.Decorator,
  typeGraphQLContext: TypeGraphQLContext<TMessageIds, TOptions>
): DecoratorType | undefined {
  const typeFunctionIndex = decoratorHasName(decoratorName) ? 1 : 0;
  const typeFunctionNode = (node.expression as TSESTree.CallExpression).arguments[typeFunctionIndex];

  if (
    typeFunctionNode?.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
    typeFunctionNode?.type !== AST_NODE_TYPES.FunctionExpression
  ) {
    return undefined;
  }

  let typeNode = typeFunctionNode.body;
  let isArray = false;

  if (typeNode.type === AST_NODE_TYPES.ArrayExpression) {
    if (typeNode.elements.length !== 1) {
      // Array must have precisely one element
      return { isValid: false };
    }
    typeNode = typeNode.elements[0];
    isArray = true;
  }

  let name = typeGraphQLContext.getImportedName(typeNode);
  if (!name && typeNode.type === AST_NODE_TYPES.Identifier) {
    name = typeNode.name;
  }

  if (!name) {
    return { isValid: false };
  }

  const nullablePropertyValue = getNullablePropertyValue(
    (node.expression as TSESTree.CallExpression).arguments[typeFunctionIndex + 1]
  );

  if ((nullablePropertyValue === 'items' || nullablePropertyValue === 'itemsAndList') && !isArray) {
    // these nullable properties are only available on arrays
    return { isValid: false };
  }

  return {
    isValid: true,
    typeName: name,
    isNullable:
      (!isArray && nullablePropertyValue === true) ||
      nullablePropertyValue === 'itemsAndList' ||
      nullablePropertyValue === 'items',
    isArray,
    isArrayNullable: isArray && (nullablePropertyValue === true || nullablePropertyValue === 'itemsAndList'),
  };
}

/**
 * Reads nullable property from options object as described here: https://github.com/MichalLytek/type-graphql/blob/master/docs/types-and-fields.md
 * @param isArray
 * @param optionsObject
 */
function getNullablePropertyValue(optionsObject: TSESTree.Expression | undefined): boolean | NullableListOptions {
  if (optionsObject?.type !== AST_NODE_TYPES.ObjectExpression) {
    return false;
  }

  for (const property of optionsObject.properties) {
    if (
      property.type !== AST_NODE_TYPES.Property ||
      property.key.type !== AST_NODE_TYPES.Identifier ||
      property.key.name !== 'nullable' ||
      property.value.type !== AST_NODE_TYPES.Literal
    ) {
      continue;
    }

    if (property.value.value === true || property.value.value === 'items' || property.value.value === 'itemsAndList') {
      return property.value.value;
    }
  }

  return false;
}
