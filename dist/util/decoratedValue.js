'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getDecoratedProps = void 0;
const experimental_utils_1 = require('@typescript-eslint/experimental-utils');
const typescript_1 = require('typescript');
function getDecoratedProps({ decoratorNode, checker, parserServices }) {
  if (!decoratorNode.parent) {
    throw new Error('Decorator without parent node');
  }
  const parent = decoratorNode.parent;
  if (parent.type === experimental_utils_1.AST_NODE_TYPES.ClassProperty) {
    const tsNode = parserServices.esTreeNodeToTSNodeMap.get(parent);
    const type = checker.getTypeAtLocation(tsNode);
    return {
      name: parent.key.name,
      kind: parent.type,
      type: getDecoratedType(type),
    };
  }
  throw new Error('Unknown decorator parent type');
}
exports.getDecoratedProps = getDecoratedProps;
function getDecoratedType(type) {
  // Check wheter the type is a promise
  if (type.flags === typescript_1.TypeFlags.Object && type.symbol.escapedName === 'Promise') {
    const typeArguments = type.resolvedTypeArguments;
    if ((typeArguments === null || typeArguments === void 0 ? void 0 : typeArguments.length) !== 1) {
      return null;
    }
    const innerType = getDecoratedType(typeArguments[0]);
    if (!(innerType === null || innerType === void 0 ? void 0 : innerType.isValid)) {
      return innerType;
    }
    return Object.assign(Object.assign({}, innerType), { isPromise: true });
  }
  // Check whether the type is nullable or undefinable
  let isNullable = false;
  let isUndefinable = false;
  if (type.flags === typescript_1.TypeFlags.Union) {
    const innerTypes = type.types;
    for (let i = innerTypes.length - 1; i >= 0; i--) {
      if (innerTypes[i].flags === typescript_1.TypeFlags.Null) {
        isNullable = true;
        innerTypes.splice(i, 1);
      } else if (innerTypes[i].flags === typescript_1.TypeFlags.Undefined) {
        isUndefinable = true;
        innerTypes.splice(i, 1);
      }
    }
    if (innerTypes.length !== 1) {
      // Union types are not supported
      return {
        isValid: false,
        tooComplex: true,
      };
    }
    type = innerTypes[0];
  }
  // Check whether the type is an array
  if (type.flags === typescript_1.TypeFlags.Object && type.symbol.name === 'Array') {
    const typeArguments = type.resolvedTypeArguments;
    if ((typeArguments === null || typeArguments === void 0 ? void 0 : typeArguments.length) !== 1) {
      return null;
    }
    const innerType = getDecoratedType(typeArguments[0]);
    if (!innerType) {
      return null;
    }
    if (!innerType.isValid || innerType.isPromise || innerType.isArray) {
      // Inner type is invalid or types are nested in an unsupported way
      return {
        isValid: false,
        tooComplex: true,
      };
    }
    return Object.assign(Object.assign({}, innerType), {
      isArray: true,
      isArrayNullable: isNullable,
      isArrayUndefinable: isUndefinable,
    });
  }
  // Check whether the type is a literal
  if (type.flags === typescript_1.TypeFlags.Number) {
    return {
      isValid: true,
      name: 'number',
      isNullable,
      isUndefinable,
    };
  } else if (type.flags === typescript_1.TypeFlags.String) {
    return {
      isValid: true,
      name: 'string',
      isNullable,
      isUndefinable,
    };
  } else if (type.flags & typescript_1.TypeFlags.Boolean) {
    return {
      isValid: true,
      name: 'boolean',
      isNullable,
      isUndefinable,
    };
  }
  // Check whether the type is an object or enum
  if (
    type.flags & typescript_1.TypeFlags.EnumLiteral ||
    type.flags === typescript_1.TypeFlags.TypeParameter ||
    type.flags === typescript_1.TypeFlags.Object
  ) {
    return {
      isValid: true,
      name: type.symbol.name,
      isNullable,
      isUndefinable,
    };
  }
  // Other types are unsupported
  return {
    isValid: false,
    tooComplex: true,
  };
}
//# sourceMappingURL=decoratedValue.js.map
