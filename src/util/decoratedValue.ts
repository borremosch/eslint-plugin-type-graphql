import { AST_NODE_TYPES, ParserServices, TSESTree } from '@typescript-eslint/experimental-utils';
import { SymbolFlags, Symbol as TSSymbol, Type, TypeChecker, TypeFlags, UnionType } from 'typescript';

export interface DecoratedProps {
  kind: AST_NODE_TYPES;
  node: TSESTree.Node;
  typeNode?: TSESTree.TypeNode;
  type: DecoratedType | null;
}

export type DecoratedType = ValidDecoratedType | InvalidDecoratedType;

export interface ValidDecoratedType {
  isValid: true;
  name: string;
  isNullable?: boolean;
  isUndefinable?: boolean;
  isArray: boolean;
  isArrayNullable?: boolean;
  isArrayUndefinable?: boolean;
  isPromise?: boolean;
}

export interface InvalidDecoratedType {
  isValid: false;
  tooComplex?: boolean;
  unknownType?: boolean;
  nullOrUndefinedType?: boolean;
  unionType?: boolean;
}

interface GetDecoratedTypeProps {
  decoratorNode: TSESTree.Decorator;
  checker: TypeChecker;
  parserServices: ParserServices;
}

function getPossibleUnionName(typedNode: TSESTree.Node): string | undefined {
  let typeAnnotation: TSESTree.TypeNode | undefined;

  if (typedNode.type === AST_NODE_TYPES.Identifier || typedNode.type === AST_NODE_TYPES.PropertyDefinition) {
    typeAnnotation = typedNode.typeAnnotation?.typeAnnotation;
  } else if (typedNode.type === AST_NODE_TYPES.MethodDefinition && typedNode.kind === 'method') {
    typeAnnotation = typedNode.value.returnType?.typeAnnotation;
  }

  if (!typeAnnotation) {
    return;
  }

  if (
    typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
    ['Array', 'Promise'].includes((typeAnnotation.typeName as TSESTree.Identifier).name)
  ) {
    typeAnnotation = typeAnnotation.typeParameters?.params?.[0] || typeAnnotation;
  }

  if (
    typeAnnotation.type === AST_NODE_TYPES.TSTypeQuery &&
    typeAnnotation.exprName.type === AST_NODE_TYPES.Identifier
  ) {
    return typeAnnotation.exprName.name;
  }

  return undefined;
}

export function getDecoratedProps({ decoratorNode, checker, parserServices }: GetDecoratedTypeProps): DecoratedProps {
  const parent = decoratorNode.parent as TSESTree.Node;
  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(parent);
  let type = checker.getTypeAtLocation(tsNode);
  let typeNode: TSESTree.TypeNode | undefined = undefined;
  let isPropertyOptional: boolean | undefined = false;

  if (parent.type === AST_NODE_TYPES.MethodDefinition) {
    typeNode = parent.value.returnType?.typeAnnotation;
    if (parent.kind === 'method' && type.getCallSignatures()[0]) {
      type = type.getCallSignatures()[0].getReturnType();
    }
  } else if (parent.type === AST_NODE_TYPES.PropertyDefinition) {
    isPropertyOptional = parent.optional;
    typeNode = (parent as TSESTree.PropertyDefinition).typeAnnotation?.typeAnnotation;
  } else {
    typeNode = (parent as TSESTree.Identifier | TSESTree.ObjectPattern).typeAnnotation?.typeAnnotation;
  }

  return {
    kind: parent.type,
    type: getDecoratedType(type, getPossibleUnionName(parent), isPropertyOptional),
    node: parent,
    typeNode,
  };
}

type EnumLiteralSymbol = TSSymbol & { parent?: TSSymbol };

function getDecoratedType(
  type: Type,
  possibleUnionName: string | undefined,
  isPropertyOptional: boolean | undefined
): DecoratedType | null {
  // Check whether TypeScript was able to determine the type
  if (type.flags === TypeFlags.Any) {
    return null;
  }

  // Check wheter the type is a promise
  if (type.flags === TypeFlags.Object && type.symbol?.escapedName === 'Promise') {
    const typeArguments = (type as unknown as { resolvedTypeArguments: Type[] }).resolvedTypeArguments;
    const innerType = getDecoratedType(typeArguments[0], possibleUnionName, isPropertyOptional);
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
  let isBooleanUnion = false;

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

    if (innerTypes.length === 0) {
      // null/undefined-only types are not supported;
      return {
        isValid: false,
        nullOrUndefinedType: true,
      };
    } else if (innerTypes.length > 1) {
      // Check whether this is a boolean
      if (innerTypes.length === 2 && innerTypes.every((innerType) => innerType.flags === TypeFlags.BooleanLiteral)) {
        isBooleanUnion = true;
      } else {
        // Check whether all types in union are part of the same enumeration (type is actually a nullable/undefinable enumartion)
        const enumerationNames = innerTypes.map(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (innerType) => innerType.flags & TypeFlags.EnumLiteral && (innerType.symbol as EnumLiteralSymbol).parent!.name
        );
        const isSameEnumeration =
          !!enumerationNames[0] && enumerationNames.every((enumerationName) => enumerationName === enumerationNames[0]);

        if (!isSameEnumeration) {
          // Not an enumation. Union types may still be valid, for example when created using createUnionType. If we found a possible union type in the AST, we will use it
          if (possibleUnionName) {
            return {
              isValid: true,
              name: possibleUnionName,
              isNullable,
              isUndefinable,
              isArray: false,
            };
          } else {
            return {
              isValid: false,
              unionType: true,
            };
          }
        }
      }
    }

    type = innerTypes[0];
  }

  // Check whether the type is an array
  if (type.flags === TypeFlags.Object && type.symbol?.name === 'Array') {
    const typeArguments = (type as unknown as { resolvedTypeArguments: Type[] }).resolvedTypeArguments;
    const innerType = getDecoratedType(typeArguments[0], possibleUnionName, isPropertyOptional);
    if (!innerType) {
      return null;
    }
    if (!innerType.isValid) {
      // Inner type is invalid
      return innerType;
    } else if (innerType.isPromise || innerType.isArray) {
      // Types are nested in an unsupported way
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
      isUndefinable: isPropertyOptional,
      isArray: false,
    };
  } else if (type.flags === TypeFlags.String) {
    return {
      isValid: true,
      name: 'string',
      isNullable,
      isUndefinable: isPropertyOptional,
      isArray: false,
    };
  } else if (type.flags & TypeFlags.Boolean || isBooleanUnion) {
    return {
      isValid: true,
      name: 'boolean',
      isNullable,
      isUndefinable: isPropertyOptional,
      isArray: false,
    };
  }

  // Check whether the type is an object or enum
  if (type.flags & TypeFlags.EnumLiteral || type.flags === TypeFlags.TypeParameter || type.flags === TypeFlags.Object) {
    let symbol = type.symbol as EnumLiteralSymbol;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (symbol?.flags === SymbolFlags.EnumMember && symbol.parent!.flags === SymbolFlags.RegularEnum) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      symbol = symbol.parent!;
    }

    return {
      isValid: true,
      name: symbol?.name,
      isNullable,
      isUndefinable,
      isArray: false,
    };
  }

  // Other types are unsupported
  return {
    isValid: false,
    unknownType: true,
  };
}
