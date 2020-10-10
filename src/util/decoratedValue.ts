import { AST_NODE_TYPES, ParserServices, TSESTree } from '@typescript-eslint/experimental-utils';
import { Type, UnionType, TypeFlags, TypeChecker } from 'typescript';

export interface DecoratedProps {
  name: string;
  kind: AST_NODE_TYPES;
  type: DecoratedType | null;
}

export interface DecoratedType {
  typeName: string;
  isNullable?: boolean;
  isUndefinable?: boolean;
  isArray?: boolean;
  isArrayNullable?: boolean;
  isArrayUndefinable?: boolean;
  isPromise?: boolean;
}

interface GetDecoratedTypeProps {
  decoratorNode: TSESTree.Decorator;
  checker: TypeChecker;
  parserServices: ParserServices;
}

export function getDecoratedProps({ decoratorNode, checker, parserServices }: GetDecoratedTypeProps): DecoratedProps {
  if (!decoratorNode.parent) {
    throw new Error('Decorator without parent node');
  }
  const parent = decoratorNode.parent;

  if (parent.type === AST_NODE_TYPES.ClassProperty) {
    const tsNode = parserServices.esTreeNodeToTSNodeMap.get(parent);
    const type = checker.getTypeAtLocation(tsNode);

    return {
      name: (parent.key as TSESTree.Identifier).name,
      kind: parent.type,
      type: getDecoratedType(type),
    };
  }

  throw new Error('Unknown decorator parent type');
}

function getDecoratedType(type: Type): DecoratedType | null {
  // Check wheter the type is a promise
  if (type.flags === TypeFlags.Object && type.symbol.escapedName === 'Promise') {
    const typeArguments = ((type as unknown) as { resolvedTypeArguments?: Type[] }).resolvedTypeArguments;
    if (typeArguments?.length !== 1) {
      return null;
    }

    const innerType = getDecoratedType(typeArguments[0]);
    return innerType
      ? {
          ...innerType,
          isPromise: true,
        }
      : null;
  }

  // Check whether the type is nullable or undefinable
  let isNullable = false;
  let isUndefinable = false;

  if (type.flags === TypeFlags.Union) {
    const innerTypes = (type as UnionType).types;

    for (let i = innerTypes.length - 1; i >= 0; i--) {
      if (innerTypes[i].flags === TypeFlags.Null) {
        isNullable = true;
        innerTypes.splice(i, 1);
      } else if (innerTypes[i].flags === TypeFlags.Undefined) {
        isUndefinable = true;
        innerTypes.splice(i, 1);
      }
    }

    if (innerTypes.length !== 1) {
      // Union types are not supported
      return null;
    }

    type = innerTypes[0];
  }

  // Check whether the type is an array
  if (type.flags === TypeFlags.Object && type.symbol.name === 'Array') {
    const typeArguments = ((type as unknown) as { resolvedTypeArguments?: Type[] }).resolvedTypeArguments;
    if (typeArguments?.length !== 1) {
      return null;
    }

    const innerType = getDecoratedType(typeArguments[0]);
    if (!innerType || innerType.isPromise || innerType.isArray) {
      // Inner type is invalid or types are nested in an unsupported way
      return null;
    }

    return {
      ...innerType,
      isArray: true,
      isArrayNullable: isNullable,
      isArrayUndefinable: isUndefinable,
    };
  }

  // Check whether the type is a literal
  if (type.flags === TypeFlags.Number) {
    return {
      typeName: 'number',
      isNullable,
      isUndefinable,
    };
  } else if (type.flags === TypeFlags.String) {
    return {
      typeName: 'string',
      isNullable,
      isUndefinable,
    };
  } else if (type.flags === TypeFlags.Boolean) {
    return {
      typeName: 'boolean',
      isNullable,
      isUndefinable,
    };
  }

  // Check whether the type is an object or enum
  if (
    type.flags === (TypeFlags.Union | TypeFlags.EnumLiteral) ||
    type.flags === TypeFlags.TypeParameter ||
    type.flags === TypeFlags.Object
  ) {
    return {
      typeName: type.symbol.name,
      isNullable,
      isUndefinable,
    };
  }

  return null;
}
