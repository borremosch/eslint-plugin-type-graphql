import path from 'path';
import rule from '../../src/rules/no-missing-decorator-type';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
const { RuleTester } = ESLintUtils;

const rootDir = path.resolve(__dirname, '../fixtures');

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-missing-decorator-type', rule, {
  valid: [],
  invalid: [
    {
      code: `
      import * as TypeGraphQL from 'type-graphql';
      import { Field as MyField } from 'type-graphql';

      @TypeGraphQL.ObjectType()
      class MyClass{
        @MyField()
        myNumber!: number;
      }`,
      errors: [
        {
          messageId: 'missingDecoratorType',
          line: 7,
          column: 9,
        },
      ],
    },
  ],
});
