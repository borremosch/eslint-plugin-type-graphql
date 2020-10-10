import { RuleContext, RuleListener } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { getNameFromCommonJsRequire } from './import';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

const TYPE_GRAPHQL_PACKAGE_NAME = 'type-graphql';

export class TypeGraphQLContext<TMessageIds extends string, TOptions extends readonly unknown[]> {
  context: Readonly<RuleContext<TMessageIds, TOptions>>;
  imports: { [key: string]: string } = {};

  constructor(context: Readonly<RuleContext<TMessageIds, TOptions>>) {
    this.context = context;
  }

  getImportVisitors(): RuleListener {
    return {
      ImportDeclaration: ({ source, specifiers }) => {
        if (source.value === TYPE_GRAPHQL_PACKAGE_NAME) {
          for (const specifier of specifiers) {
            switch (specifier.type) {
              case 'ImportNamespaceSpecifier':
              case 'ImportDefaultSpecifier':
                // E.g. import * as TypeGraphQL from 'type-graphql';
                this.imports[specifier.local.name] = '*';
                break;
              case 'ImportSpecifier':
                // E.g. import { ObjectType, Field as TypeGraphQLField } from 'type-graphql';
                this.imports[specifier.local.name] = specifier.imported.name;
                break;
            }
          }
        }
      },
      VariableDeclarator: ({ init, id }) => {
        const source = getNameFromCommonJsRequire(init as TSESTree.CallExpression);
        if (source === TYPE_GRAPHQL_PACKAGE_NAME) {
          if (id.type === AST_NODE_TYPES.Identifier) {
            // E.g. const TypeGraphQL = require('type-graphql');
            this.imports[id.name] = '*';
          } else if (id.type === AST_NODE_TYPES.ObjectPattern) {
            // E.g. const { ObjectType, Field: TypeGraphQLField } = require('type-graphql');
            for (const property of id.properties) {
              if (property.type === AST_NODE_TYPES.RestElement) {
                // Rest element not supported
                continue;
              }
              const propertyName = (property.value as TSESTree.Identifier).name;
              this.imports[propertyName] = (property.key as TSESTree.Identifier).name;
            }
          }
        }
      },
    };
  }

  getImportedName(node: TSESTree.Decorator): string | null {
    const callee = (node.expression as TSESTree.CallExpression).callee;
    if (callee.type === AST_NODE_TYPES.Identifier) {
      // E.g. @ObjectType()
      return this.imports[callee.name] ?? null;
    } else if (
      callee.type === AST_NODE_TYPES.MemberExpression &&
      this.imports[(callee.object as TSESTree.Identifier).name] === '*'
    ) {
      // E.g. @TypeGraphQL.ObjectType()
      return (callee.property as TSESTree.Identifier).name;
    }

    return null;
  }
}
