import path from 'path';
import rule from '../../src/rules/invalid-nullable-output-type';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
const { RuleTester } = ESLintUtils;
import {
  createObjectType,
  CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
  CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET,
  createResolver,
  CREATE_RESOLVER_CODE_LINE_OFFSET,
  CREATE_RESOLVER_CODE_COLUMN_OFFSET,
  createInputType,
  createArgsType,
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
    messageId: 'invalidNullableOutputType',
    line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
    column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 1,
  },
];

ruleTester.run('invalid-nullable-output-type', rule, {
  valid: [
    createObjectType('@Field(() => String)\nmyString!: string;'),
    createObjectType('@Field(() => String, { nullable: true })\nmyString!: string | null;'),
    createObjectType('@Field(() => [String])\nmyArray!: string[];'),
    createObjectType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | null;'),
    createObjectType('@Field(() => [String])\nmyArray!: Array<string>;'),
    createObjectType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | null>;"),
    createObjectType('@Field(() => [String], { nullable: true })\nmyArray!: Array<string> | null;'),
    createObjectType("@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | null> | null;"),
    createObjectType("@Field(() => String)\nget myString(){ return 'value'; }"),
    createObjectType('@Field(() => String)\nmyString!: any;'),
    createObjectType('@Field(() => [String])\nmyString!: string;'),
    createInputType('@Field(() => String, { nullable: true })\nmyString?: string | null;'),
    createArgsType('@Field(() => [String], { nullable: true })\nmyArray?: string[] | null;'),
    createInputType('@Field(() => String, { nullable: true })\nmyString!: string | null;'),
    createArgsType('@Field(() => String, { nullable: true })\nmyString!: string | undefined;'),
    createInputType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | null;'),
    createArgsType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | undefined;'),
    createInputType('@Field(() => [String], { nullable: true })\nmyArray?: string[];'),
    createArgsType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | null>;"),
    createInputType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | undefined>;"),
    createArgsType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | null | undefined>;"),
    createArgsType(
      "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | null | undefined> | null | undefined;"
    ),
    createArgsType(
      "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray?: Array<string | null | undefined> | null;"
    ),
    createArgsType(
      "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | null | undefined> | undefined;"
    ),
    createInputType(
      "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | undefined> | null | undefined;"
    ),
    createResolver("@Query(() => String, { nullable: true })\nmyQuery(): string | null { return 'value'; }", ['Query']),
    createResolver(
      "@Query(() => String, { nullable: true })\nmyQuery(@Arg(() => String, { nullable: true }) myString: string | null | undefined): string | null{ return 'value'; }",
      ['Query', 'Arg']
    ),
    createResolver(
      "@Query(() => String, { nullable: true })\nmyQuery(@Arg(() => [String], { nullable: 'items' }) myString: Array<string | null | undefined>): string | null{ return 'value'; }",
      ['Query', 'Arg']
    ),
    createResolver(
      "@Query(() => String, { nullable: true })\nmyQuery(@Args(() => MyArgsType, { nullable: true }) myArgs: MyArgsType | null | undefined): string | null{ return 'value'; }",
      ['Query', 'Args']
    ),
    createResolver(
      "@Query(() => String, { nullable: true })\nmyQuery(@Arg('myString', () => String, { nullable: true }) myString: string | undefined): string | null{ return 'value'; }",
      ['Query', 'Arg']
    ),
    createResolver(
      "@Query(() => String, { nullable: true })\nmyQuery(@Arg('myString', () => [String], { nullable: 'items' }) myString: Array<string | null>): string | null{ return 'value'; }",
      ['Query', 'Arg']
    ),
    'type MyArgsType = {};\n' +
      createResolver(
        "@Query(() => String, { nullable: true })\nmyQuery(@Args(() => MyArgsType, { nullable: true }) myArgs: MyArgsType | null): string | null{ return 'value'; }",
        ['Query', 'Args']
      ),
  ],
  invalid: [
    {
      code: createObjectType('@Field(() => String, { nullable: true })\nmyString!: string | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field(() => String, { nullable: true })\nmyString!: string | null | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | null | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | undefined>;"),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType(
        "@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | null | undefined>;"
      ),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field(() => [String], { nullable: true })\nmyArray!: Array<string> | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field(() => [String], { nullable: true })\nmyArray!: Array<string> | null | undefined;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType(
        "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | undefined> | undefined;"
      ),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType(
        "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | null | undefined> | null | undefined;"
      ),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createResolver(
        "@Query(() => String, { nullable: true })\nmyQuery(@Arg('myString', () => String, { nullable: true }) myString: string | undefined): string | undefined{ return 'value'; }",
        ['Query', 'Arg']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 1,
          messageId: 'invalidNullableOutputType',
        },
      ],
    },
    {
      code: createResolver(
        "@Query(() => String, { nullable: true })\nmyQuery(@Arg('myString', () => [String], { nullable: 'items' }) myString: Array<string | null>): string | undefined | null{ return 'value'; }",
        ['Query', 'Arg']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 1,
          messageId: 'invalidNullableOutputType',
        },
      ],
    },
    {
      code:
        'type MyArgsType = {};\n' +
        createResolver(
          "@Query(() => String, { nullable: true })\nmyQuery(@Args(() => MyArgsType, { nullable: true }) myArgs: MyArgsType | null): string { return 'value'; }",
          ['Query', 'Args']
        ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 1,
          messageId: 'invalidNullableOutputType',
        },
      ],
    },
  ],
});
