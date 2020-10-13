import { TypeGraphQLContext } from '../../src/util/TypeGraphQLContext';
import { parse } from '@typescript-eslint/parser';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';
import 'jest';

function getResolvedTypeName(importStatement: string, localTypeName: string) {
  const ast = parse(`${importStatement}\n${localTypeName}`);

  const context = new TypeGraphQLContext();
  const visitors = context.getImportVisitors();

  if (ast.body[0].type === AST_NODE_TYPES.ImportDeclaration) {
    visitors.ImportDeclaration(ast.body[0]);
  } else if (ast.body[0].type === AST_NODE_TYPES.VariableDeclaration) {
    for (const declaration of ast.body[0].declarations) {
      if (declaration.type === AST_NODE_TYPES.VariableDeclarator) {
        visitors.VariableDeclarator(declaration);
      }
    }
  }

  return context.getTypeGraphQLImportedName((ast.body[1] as TSESTree.ExpressionStatement).expression);
}

describe('TypeGraphQLContext', () => {
  it('should resolve imports', () => {
    expect(getResolvedTypeName("import { Field } from 'type-graphql'", 'Field')).toEqual('Field');
    expect(getResolvedTypeName("import { Field } from 'type-graphql'", 'ObjectType')).toEqual(null);
    expect(getResolvedTypeName("import { Field, ObjectType } from 'type-graphql'", 'ObjectType')).toEqual('ObjectType');
  });

  it('should resolve aliased imports', () => {
    expect(getResolvedTypeName("import { Field as MyField } from 'type-graphql'", 'MyField')).toEqual('Field');
    expect(getResolvedTypeName("import { Field as MyField } from 'type-graphql'", 'Field')).toEqual(null);
    expect(
      getResolvedTypeName("import { Field, ObjectType as MyObjectType } from 'type-graphql'", 'MyObjectType')
    ).toEqual('ObjectType');
  });

  it('should resolve namespaced imports', () => {
    expect(getResolvedTypeName("import * as TypeGraphQL from 'type-graphql'", 'TypeGraphQL.Field')).toEqual('Field');
  });

  it('should resolve commonjs imports', () => {
    expect(getResolvedTypeName("const { Field } = require('type-graphql');", 'Field')).toEqual('Field');
    expect(getResolvedTypeName("const { Field, ObjectType } = require('type-graphql');", 'ObjectType')).toEqual(
      'ObjectType'
    );
  });

  it('should resolve aliased commonjs imports', () => {
    expect(getResolvedTypeName("const { Field: MyField } = require('type-graphql');", 'MyField')).toEqual('Field');
    expect(
      getResolvedTypeName("const { Field, ObjectType: MyObjectType } = require('type-graphql');", 'MyObjectType')
    ).toEqual('ObjectType');
  });

  it('should resolve namespaces commonjs imports', () => {
    expect(getResolvedTypeName("const TypeGraphQL = require('type-graphql');", 'TypeGraphQL.Field')).toEqual('Field');
  });

  it('should ignore the rest operator in a commonjs import', () => {
    expect(getResolvedTypeName("const {Field, ...TypeGraphQL} = require('type-graphql');", 'Field')).toEqual('Field');
    expect(
      getResolvedTypeName("const {Field, ...TypeGraphQL} = require('type-graphql');", 'TypeGraphQL.ObjectType')
    ).toEqual(null);
  });

  it('should ignore other package names', () => {
    expect(getResolvedTypeName("import { Field } from 'other-package';", 'Field')).toEqual(null);
    expect(getResolvedTypeName("const { Field } = require('other-package');", 'Field')).toEqual(null);
    expect(getResolvedTypeName('const { Field } = require(null);', 'Field')).toEqual(null);
  });

  it('should ignore other object deconstructors', () => {
    expect(getResolvedTypeName("const { Field } = norequire('type-graphql')", 'Field')).toEqual(null);
  });

  it('should ignore other variable declarators', () => {
    expect(getResolvedTypeName("const str = 'value'", 'Field')).toEqual(null);
  });
});
