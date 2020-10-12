import { DecoratedType, getDecoratedProps } from '../../src/util/decoratedValue';
import { parseForESLint } from '@typescript-eslint/parser';
import 'jest';
import { TSESTree } from '@typescript-eslint/experimental-utils';
import path from 'path';

const rootDir = path.resolve(__dirname, '../fixtures');

function getDecoratedTypeFromCode(typeDefinition: string, initialization = ''): DecoratedType | null {
  const { ast, services } = parseForESLint(
    `${initialization}\nclass MyClass{
  @Decorator()
  myFunction(): ${typeDefinition} {}
}`,
    {
      filePath: 'file.ts',
      sourceType: 'module',
      tsconfigRootDir: rootDir,
      project: './tsconfig.json',
    }
  );

  const methodDefinitionNode = (ast.body[ast.body.length - 1] as TSESTree.ClassDeclaration).body
    .body[0] as TSESTree.MethodDefinition;
  const decoratorNode = methodDefinitionNode.decorators[0];

  return getDecoratedProps({
    parserServices: services,
    checker: services.program.getTypeChecker(),
    decoratorNode: { ...decoratorNode, parent: methodDefinitionNode },
  }).type;
}

describe('getDecoratedType', () => {
  it('should return null when the type is any', () => {
    expect(getDecoratedTypeFromCode('any')).toEqual(null);
  });

  it('should return null when the type is a promise of any', () => {
    expect(getDecoratedTypeFromCode('Promise<any>')).toEqual(null);
  });

  it('should return null when the type is an array of any', () => {
    expect(getDecoratedTypeFromCode('Array<any>')).toEqual(null);
  });

  it('should return { isValid: false } when the type is a promise of an unknown type', () => {
    expect(getDecoratedTypeFromCode('unknown')).toEqual({ isValid: false, unknownType: true });
  });
});
