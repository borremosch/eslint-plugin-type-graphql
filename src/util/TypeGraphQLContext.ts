import { RuleListener } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { getNameFromCommonJsRequire } from './import';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

const TYPE_GRAPHQL_PACKAGE_NAME = 'type-graphql';

type ImportMap = { [key: string]: string };

export class TypeGraphQLContext {
  typeGraphQLImports: ImportMap = {};
  imports: ImportMap = {};

  getImportVisitors(): RuleListener {
    return {
      ImportDeclaration: ({ source, specifiers }) => {
        const imports = source.value === TYPE_GRAPHQL_PACKAGE_NAME ? this.typeGraphQLImports : this.imports;

        for (const specifier of specifiers) {
          switch (specifier.type) {
            case 'ImportNamespaceSpecifier':
            case 'ImportDefaultSpecifier':
              // E.g. import * as TypeGraphQL from 'type-graphql';
              imports[specifier.local.name] = '*';
              break;
            case 'ImportSpecifier':
              // E.g. import { ObjectType, Field as TypeGraphQLField } from 'type-graphql';
              imports[specifier.local.name] = specifier.imported.name;
              break;
          }
        }
      },
      VariableDeclarator: ({ init, id }) => {
        if (init?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const source = getNameFromCommonJsRequire(init);
        if (source === null) {
          return;
        }
        const imports = source === TYPE_GRAPHQL_PACKAGE_NAME ? this.typeGraphQLImports : this.imports;

        if (id.type === AST_NODE_TYPES.Identifier) {
          // E.g. const TypeGraphQL = require('type-graphql');
          imports[id.name] = '*';
        } else if (id.type === AST_NODE_TYPES.ObjectPattern) {
          // E.g. const { ObjectType, Field: TypeGraphQLField } = require('type-graphql');
          for (const property of id.properties) {
            if (property.type === AST_NODE_TYPES.RestElement) {
              // Rest element not supported
              continue;
            }
            const propertyName = (property.value as TSESTree.Identifier).name;
            imports[propertyName] = (property.key as TSESTree.Identifier).name;
          }
        }
      },
    };
  }

  private _getImportedName(node: TSESTree.Node, map: ImportMap): string | null {
    if (node.type === AST_NODE_TYPES.Identifier) {
      // E.g. @ObjectType()
      return map[node.name] ?? null;
    } else if (
      node.type === AST_NODE_TYPES.MemberExpression &&
      map[(node.object as TSESTree.Identifier).name] === '*'
    ) {
      // E.g. @TypeGraphQL.ObjectType()
      return (node.property as TSESTree.Identifier).name;
    }

    return null;
  }

  getTypeGraphQLImportedName(node: TSESTree.Node): string | null {
    return this._getImportedName(node, this.typeGraphQLImports);
  }

  getImportedName(node: TSESTree.Node): string | null {
    return this._getImportedName(node, this.imports);
  }
}
