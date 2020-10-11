'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getDecoratorProps = exports.decoratorHasName = void 0;
const experimental_utils_1 = require('@typescript-eslint/experimental-utils');
const OPERATION_DECORATORS = ['Mutation', 'Query', 'Subscription'];
const ARG_DECORATOR = 'Arg';
const ARGS_DECORATOR = 'Args';
const FIELD_DECORATOR = 'Field';
const ALL_DECORATORS = [...OPERATION_DECORATORS, ARG_DECORATOR, ARGS_DECORATOR, FIELD_DECORATOR];
function decoratorHasName(decoratorName) {
  return decoratorName === ARG_DECORATOR;
}
exports.decoratorHasName = decoratorHasName;
function getDecoratorProps({ node, typeGraphQLContext }) {
  const name = typeGraphQLContext.getImportedName(node.expression.callee);
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
exports.getDecoratorProps = getDecoratorProps;
function getDecoratorType(decoratorName, node, typeGraphQLContext) {
  const typeFunctionIndex = decoratorHasName(decoratorName) ? 1 : 0;
  const typeFunctionNode = node.expression.arguments[typeFunctionIndex];
  if (
    (typeFunctionNode === null || typeFunctionNode === void 0 ? void 0 : typeFunctionNode.type) !==
      experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression &&
    (typeFunctionNode === null || typeFunctionNode === void 0 ? void 0 : typeFunctionNode.type) !==
      experimental_utils_1.AST_NODE_TYPES.FunctionExpression
  ) {
    return undefined;
  }
  let typeNode = typeFunctionNode.body;
  let isArray = false;
  if (typeNode.type === experimental_utils_1.AST_NODE_TYPES.ArrayExpression) {
    if (typeNode.elements.length !== 1) {
      // Array must have precisely one element
      return { isValid: false, multiElementArray: true };
    }
    typeNode = typeNode.elements[0];
    isArray = true;
  }
  let name = typeGraphQLContext.getImportedName(typeNode);
  if (!name && typeNode.type === experimental_utils_1.AST_NODE_TYPES.Identifier) {
    name = typeNode.name;
  }
  if (!name) {
    return { isValid: false, invalidTypeFunction: true };
  }
  const nullablePropertyValue = getNullablePropertyValue(node.expression.arguments[typeFunctionIndex + 1]);
  if ((nullablePropertyValue === 'items' || nullablePropertyValue === 'itemsAndList') && !isArray) {
    // these nullable properties are only available on arrays
    return { isValid: false, invalidNullableValue: nullablePropertyValue };
  }
  return {
    isValid: true,
    name: name,
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
function getNullablePropertyValue(optionsObject) {
  if (
    (optionsObject === null || optionsObject === void 0 ? void 0 : optionsObject.type) !==
    experimental_utils_1.AST_NODE_TYPES.ObjectExpression
  ) {
    return false;
  }
  for (const property of optionsObject.properties) {
    if (
      property.type !== experimental_utils_1.AST_NODE_TYPES.Property ||
      property.key.type !== experimental_utils_1.AST_NODE_TYPES.Identifier ||
      property.key.name !== 'nullable' ||
      property.value.type !== experimental_utils_1.AST_NODE_TYPES.Literal
    ) {
      continue;
    }
    if (property.value.value === true || property.value.value === 'items' || property.value.value === 'itemsAndList') {
      return property.value.value;
    }
  }
  return false;
}
//# sourceMappingURL=decoratorValue.js.map
