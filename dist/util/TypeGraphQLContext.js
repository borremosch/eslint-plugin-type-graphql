'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.TypeGraphQLContext = void 0;
const import_1 = require('./import');
const types_1 = require('@typescript-eslint/types');
const TYPE_GRAPHQL_PACKAGE_NAME = 'type-graphql';
class TypeGraphQLContext {
  constructor(context) {
    this.imports = {};
    this.context = context;
  }
  getImportVisitors() {
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
        const source = import_1.getNameFromCommonJsRequire(init);
        if (source === TYPE_GRAPHQL_PACKAGE_NAME) {
          if (id.type === types_1.AST_NODE_TYPES.Identifier) {
            // E.g. const TypeGraphQL = require('type-graphql');
            this.imports[id.name] = '*';
          } else if (id.type === types_1.AST_NODE_TYPES.ObjectPattern) {
            // E.g. const { ObjectType, Field: TypeGraphQLField } = require('type-graphql');
            for (const property of id.properties) {
              if (property.type === types_1.AST_NODE_TYPES.RestElement) {
                // Rest element not supported
                continue;
              }
              const propertyName = property.value.name;
              this.imports[propertyName] = property.key.name;
            }
          }
        }
      },
    };
  }
  getImportedName(node) {
    var _a;
    if (node.type === types_1.AST_NODE_TYPES.Identifier) {
      // E.g. @ObjectType()
      return (_a = this.imports[node.name]) !== null && _a !== void 0 ? _a : null;
    } else if (node.type === types_1.AST_NODE_TYPES.MemberExpression && this.imports[node.object.name] === '*') {
      // E.g. @TypeGraphQL.ObjectType()
      return node.property.name;
    }
    return null;
  }
}
exports.TypeGraphQLContext = TypeGraphQLContext;
//# sourceMappingURL=TypeGraphQLContext.js.map
