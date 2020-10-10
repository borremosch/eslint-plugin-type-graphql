import { AST_NODE_TYPES, ParserServices, TSESTree } from '@typescript-eslint/experimental-utils';
import { Type, TypeFlags, TypeChecker } from 'typescript';

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
  isTooComplex?: boolean;
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
  if (type.flags === TypeFlags.Number || type.flags === TypeFlags.String || type.flags === TypeFlags.Boolean) {
    // Simple literal type
    // console.log(type);
    return {
      typeName: 'Number',
    };
  }

  return null;
}
