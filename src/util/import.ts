import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

export function getNameFromCommonJsRequire(init: TSESTree.CallExpression): string | null {
  if (
    (init?.callee as TSESTree.Identifier)?.name === 'require' &&
    init?.arguments?.length === 1 &&
    init?.arguments[0].type === AST_NODE_TYPES.Literal
  ) {
    return init.arguments[0].value?.toString() ?? null;
  }

  return null;
}
