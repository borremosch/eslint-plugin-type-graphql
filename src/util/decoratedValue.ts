import { AST_NODE_TYPES, ParserServices, TSESTree } from '@typescript-eslint/experimental-utils';
import { Type, UnionType, TypeFlags, TypeChecker } from 'typescript';

export interface DecoratedProps {
  kind: AST_NODE_TYPES;
  type: DecoratedType | null;
}

export type DecoratedType = ValidDecoratedType | InvalidDecoratedType;

export interface ValidDecoratedType {
  isValid: true;
  name: string;
  isNullable?: boolean;
  isUndefinable?: boolean;
  isArray?: boolean;
  isArrayNullable?: boolean;
  isArrayUndefinable?: boolean;
  isPromise?: boolean;
}

export interface InvalidDecoratedType {
  isValid: false;
  tooComplex?: boolean;
  unknownType?: boolean;
}

interface GetDecoratedTypeProps {
  decoratorNode: TSESTree.Decorator;
  checker: TypeChecker;
  parserServices: ParserServices;
}

export function getDecoratedProps({ decoratorNode, checker, parserServices }: GetDecoratedTypeProps): DecoratedProps {
  const parent = decoratorNode.parent as TSESTree.Node;
  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(parent);
  let type = checker.getTypeAtLocation(tsNode);

  if (parent.type === AST_NODE_TYPES.MethodDefinition && parent.kind === 'method') {
    type = type.getCallSignatures()[0].getReturnType();
  }

  return {
    kind: parent.type,
    type: getDecoratedType(type),
  };
}

function getDecoratedType(type: Type): DecoratedType | null {
  // Check whether TypeScript was able to determine the type
  if (type.flags === TypeFlags.Any) {
    return null;
  }

  // Check wheter the type is a promise
  if (type.flags === TypeFlags.Object && type.symbol.escapedName === 'Promise') {
    const typeArguments = ((type as unknown) as { resolvedTypeArguments: Type[] }).resolvedTypeArguments;
    const innerType = getDecoratedType(typeArguments[0]);
    if (!innerType?.isValid) {
      return innerType;
    }
    return {
      ...innerType,
      isPromise: true,
    };
  }

  // Check whether the type is nullable or undefinable
  let isNullable = false;
  let isUndefinable = false;

  if (type.flags === TypeFlags.Union) {
    const innerTypes = [...(type as UnionType).types];

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
      return {
        isValid: false,
        tooComplex: true,
      };
    }

    type = innerTypes[0];
  }

  // Check whether the type is an array
  if (type.flags === TypeFlags.Object && type.symbol.name === 'Array') {
    const typeArguments = ((type as unknown) as { resolvedTypeArguments: Type[] }).resolvedTypeArguments;
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
      isValid: true,
      name: 'number',
      isNullable,
      isUndefinable,
    };
  } else if (type.flags === TypeFlags.String) {
    return {
      isValid: true,
      name: 'string',
      isNullable,
      isUndefinable,
    };
  } else if (type.flags & TypeFlags.Boolean) {
    return {
      isValid: true,
      name: 'boolean',
      isNullable,
      isUndefinable,
    };
  }

  // Check whether the type is an object or enum
  if (type.flags & TypeFlags.EnumLiteral || type.flags === TypeFlags.TypeParameter || type.flags === TypeFlags.Object) {
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
    unknownType: true,
  };
}
