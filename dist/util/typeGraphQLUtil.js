'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getExpectedTypeGraphQLSignatures = exports.getTypeGraphQLDecoratorSignature = exports.getTypeGraphQLVisitors = void 0;
const decoratedValue_1 = require('./decoratedValue');
const decoratorValue_1 = require('./decoratorValue');
const TypeGraphQLContext_1 = require('./TypeGraphQLContext');
function getTypeGraphQLDecoratorVisitor(typeGraphQLContext, checker, parserServices, reporter) {
  return (decoratorNode) => {
    const decoratorProps = decoratorValue_1.getDecoratorProps({ node: decoratorNode, typeGraphQLContext });
    if (!decoratorProps) {
      // Not a TypeGraphQL decorator, ignore
      return;
    }
    const decoratedProps = decoratedValue_1.getDecoratedProps({ decoratorNode, checker, parserServices });
    reporter({ decoratorProps, decoratedProps });
  };
}
function getTypeGraphQLVisitors(context, checker, parserServices, reporter) {
  const typeGraphQLContext = new TypeGraphQLContext_1.TypeGraphQLContext(context);
  const visitors = typeGraphQLContext.getImportVisitors();
  visitors.Decorator = getTypeGraphQLDecoratorVisitor(typeGraphQLContext, checker, parserServices, reporter);
  visitors.dec;
  return visitors;
}
exports.getTypeGraphQLVisitors = getTypeGraphQLVisitors;
function getTypeGraphQLDecoratorSignature(type) {
  return {
    typeFunction: getTypeFunction(type),
    nullableOption: getNullableOption(type),
  };
}
exports.getTypeGraphQLDecoratorSignature = getTypeGraphQLDecoratorSignature;
function getTypeFunction(type) {
  let typeFunctionBody = type.name;
  if (type.isArray) {
    typeFunctionBody = '[' + typeFunctionBody + ']';
  }
  return `() => ${typeFunctionBody}`;
}
function getNullableOption(type) {
  if (type.isArray) {
    if (type.isArrayNullable || type.isArrayUndefinable) {
      if (type.isNullable || type.isUndefinable) {
        return "{ nullable: 'itemsAndList' }";
      }
      return '{ nullable: true }';
    } else if (type.isNullable || type.isUndefinable) {
      return "{ nullable: 'items' }";
    }
  } else if (type.isNullable || type.isUndefinable) {
    return '{ nullable: true }';
  }
  return undefined;
}
const EXPECTED_TYPE_NAME_MAP = {
  number: ['Int', 'Float'],
  string: ['String'],
  boolean: ['Boolean'],
  Date: ['Date', 'String'],
};
function getExpectedTypeGraphQLSignatures(type) {
  const expectedTypeNames = EXPECTED_TYPE_NAME_MAP[type.name] || [type.name];
  return {
    typeFunctions: expectedTypeNames.map((expectedTypeName) =>
      getTypeFunction(Object.assign(Object.assign({}, type), { name: expectedTypeName }))
    ),
    nullableOption: getNullableOption(type),
  };
}
exports.getExpectedTypeGraphQLSignatures = getExpectedTypeGraphQLSignatures;
//# sourceMappingURL=typeGraphQLUtil.js.map
