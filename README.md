[![npm version](https://badge.fury.io/js/eslint-plugin-type-graphql.svg)](https://badge.fury.io/js/eslint-plugin-type-graphql)
![build](https://github.com/borremosch/eslint-plugin-type-graphql/workflows/Node.js%20CI/badge.svg)
[![codecov](https://codecov.io/gh/borremosch/eslint-plugin-type-graphql/branch/main/graph/badge.svg)](https://codecov.io/gh/borremosch/eslint-plugin-type-graphql)

# eslint-plugin-type-graphql

TypeGraphQL linting rules for ESLint

## Installation

Install prerequisites:

```bash
npm i -D eslint @typescript-eslint/parser
```

Install eslint-plugin-type-graphql:

```bash
npm i -D eslint-plugin-type-graphql
```

## Recommended configuration

Create an ESLint configuration and add the plugin rules like so:

```json
{
  "plugins": ["type-graphql"],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:type-graphql/recommended"
  ],
  "parser": "@typescript-eslint/parser"
}
```

## Provided rules

- [invalid-decorated-type](docs/rules/invalid-decorated-type.md): Find errors in types that are decorated
- [invalid-decorator-type](docs/rules/invalid-decorator-type.md): Find errors in decorators
- [no-missing-decorator-type](docs/rules/no-missing-decorator-type.md): Find missing type functions in decorators
- [prefer-null-over-undefined](docs/rules/prefer-null-over-undefined.md): Warn when undefined is used instead of null
- [wrong-decorator-signature](docs/rules/wrong-decorator-signature.md): Find mismatches between decorators and decorated types

## License

This plugin is licensed under the [Apache 2.0 license](https://opensource.org/licenses/Apache-2.0).
