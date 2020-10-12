import path from 'path';
import rule from '../../src/rules/prefer-null-over-undefined';
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

const DEFAULT_ERRORS = [
  {
    messageId: 'preferNullOverUndefined',
    line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
    column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 1,
  },
];

ruleTester.run('prefer-null-over-undefined', rule, {
  valid: [
    createObjectType('@Field()\nmyString!: string;'),
    createObjectType('@Field()\nmyString!: string | null;'),
    createObjectType('@Field()\nmyArray!: string[];'),
    createObjectType('@Field()\nmyArray!: string[] | null;'),
    createObjectType('@Field()\nmyArray!: (string | null)[];'),
    createObjectType('@Field()\nmyArray!: (string | null)[] | null;'),
    createObjectType('@Field()\nmyArray!: Array<string>;'),
    createObjectType('@Field()\nmyArray!: Array<string | null>;'),
    createObjectType('@Field()\nmyArray!: Array<string> | null;'),
    createObjectType('@Field()\nmyArray!: Array<string | null> | null;'),
    createObjectType('@Field()\nmyArray!: string | number | undefined;'), // Decorated type is not expressable in GraphQL. Handled by other rule
    createObjectType("@Field()\nget myString(){ return 'value'; }"),
    createResolver("@Query(() => String)\nmyQuery(){ return 'value'; }", ['Query']),
    createResolver('@Query(() => String)\necho(@Arg() input: string){ return input; }', ['Query', 'Arg']),
    createResolver('@Query(() => String)\necho(@Arg() input: string){ return input; }', ['Query', 'Arg']),
    'class MyArgs{}\n' +
      createResolver('\n@Query(() => String)\necho(@Args() { input }: MyArgs): string { return input; }', [
        'Query',
        'Args',
      ]),
  ],
  invalid: [
    {
      code: createObjectType('@Field()\nmyString!: string | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyString?: string;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray!: string[] | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray?: string[] | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray!: (string | undefined)[];'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray!: (string | undefined)[] | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray?: (string | undefined)[];'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray!: Array<string> | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray?: Array<string>;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray!: Array<string | undefined>;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray!: Array<string | undefined> | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyArray?: Array<string | undefined>;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType("@Field()\nget myString(): string | undefined { return 'value'; }"),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createResolver("@Query()\nmyQuery(): string | undefined { return 'value'; }", ['Query']),
      errors: [
        {
          messageId: 'preferNullOverUndefined',
          line: CREATE_RESOLVER_CODE_LINE_OFFSET,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 1,
        },
      ],
    },
    {
      code: createResolver(
        "@Query()\necho(@Arg('input') input: string | undefined): string | null { return input ?? null; }",
        ['Query', 'Arg']
      ),
      errors: [
        {
          messageId: 'preferNullOverUndefined',
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 6,
        },
      ],
    },
  ],
});
