import path from 'path';
import rule from '../../src/rules/no-missing-decorator-type';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
const { RuleTester } = ESLintUtils;
import {
  createObjectType,
  CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
  CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET,
  createResolver,
  CREATE_RESOLVER_CODE_LINE_OFFSET,
  CREATE_RESOLVER_CODE_COLUMN_OFFSET,
} from '../testUtil/testCode';

const rootDir = path.resolve(__dirname, '../fixtures');

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

const DEFAULT_ERROR_LOCATION = {
  line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
  column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 1,
};

ruleTester.run('no-missing-decorator-type', rule, {
  valid: [
    createObjectType('@Field()\nmyString!: string;'),
    createObjectType('@Field()\nmyBoolean!: boolean;'),
    createObjectType('@Field()\nmyBoolean!: boolean;'),
    createObjectType('@Field(() => Int)\nmyNumber!: number;', ['Field', 'Int']),
    createObjectType('@Field(() => String, { nullable: true })\nmyString!: string | null;'),
    createObjectType("@Field()\nget myString(){ return 'value'; }"),
    createResolver("@Query()\nmyQuery(){ return 'value'; }", ['Query']),
    createResolver('@Query(() => String)\necho(@Arg() input: string){ return input; }', ['Query', 'Arg']),
  ],
  invalid: [
    {
      code: createObjectType('@Field()\nmyNumber!: number;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'missingNumberDecoratorType' }],
    },
    {
      code: createObjectType('@Field()\nmyString!: string | null;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'missingNonTrivialDecoratorType' }],
    },
    {
      code: createResolver('@Query()\nmyQuery(){ return 5; }', ['Query']),
      errors: [
        {
          messageId: 'missingNumberDecoratorType',
          line: CREATE_RESOLVER_CODE_LINE_OFFSET,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 1,
        },
      ],
    },
    {
      code: createResolver("@Query(() => Int)\necho(@Arg('input') input: number){ return input; }", ['Query', 'Arg']),
      errors: [
        {
          messageId: 'missingNumberDecoratorType',
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 6,
        },
      ],
    },
  ],
});

ruleTester.run('no-missing-decorator-type - nontrivial', rule, {
  valid: [
    {
      code: createObjectType('@Field()\nmyNumber!: number;'),
      options: ['nontrivial'],
    },
  ],
  invalid: [],
});

ruleTester.run('no-missing-decorator-type - all', rule, {
  valid: [
    {
      code:
        'class MyArgs{}\n' +
        createResolver(
          '\n@Query(() => String)\necho(@Args(() => MyArgs) { input }: MyArgs): string { return input; }',
          ['Query', 'Args']
        ),
      options: ['all'],
    },
  ],
  invalid: [
    {
      code: createObjectType('@Field()\nmyString!: string;'),
      options: ['all'],
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'missingDecoratorType' }],
    },
    {
      code: createObjectType('@Field()\nmyBoolean!: boolean;'),
      options: ['all'],
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'missingDecoratorType' }],
    },
    {
      code:
        'class MyArgs{}\n' +
        createResolver('\n@Query(() => String)\necho(@Args() { input }: MyArgs): string { return input; }', [
          'Query',
          'Args',
        ]),
      options: ['all'],
      errors: [
        {
          messageId: 'missingDecoratorType',
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 3,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 6,
        },
      ],
    },
  ],
});
