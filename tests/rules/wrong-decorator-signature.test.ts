import path from 'path';
import rule from '../../src/rules/wrong-decorator-signature';
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

ruleTester.run('wrong-decorator-signature', rule, {
  valid: [
    createObjectType('@Field(() => String)\nmyString!: string;'),
    createObjectType('@Field(function(){ return String; })\nmyString!: string;'),
    createObjectType('@Field(() => String, { nullable: true })\nmyString!: string | null;'),
    createObjectType('@Field(() => String, { nullable: true })\nmyString!: string | undefined;'),
    createObjectType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | null>;"),
    createObjectType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | undefined>;"),
    createObjectType(
      "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | undefined> | null;"
    ),
    createObjectType(
      "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | null> | undefined;"
    ),
    createObjectType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | null;'),
    createObjectType('@Field(() => Boolean)\nmyBoolean!: boolean;'),
    createObjectType('@Field(() => Int)\nmyInt!: number;'),
    createObjectType('@Field(() => Float)\nmyFloat!: number;'),
    createObjectType('@Field(() => ID)\nmyID!: string;'),
    createObjectType('@Field(() => ID)\nmyID!: number;'),
    createObjectType('@Field(() => Date)\nmyDate!: Date;'),
    createObjectType('@Field(() => String)\nmyDate!: Date;'),
    createObjectType("@Field(() => String, { nullable: 'items' })\nmyString!: string"), // Decorator is invalid rather than wrong
    createObjectType("@Field(() => String)\nget myString(){ return 'value'; }"),
    createObjectType('@Field(() => String)\nmyString!: any;'),
    createResolver("@Query(() => String)\nmyQuery(){ return 'value'; }", ['Query']),
    createResolver('@Query(() => String)\necho(@Arg() input: string){ return input; }', ['Query', 'Arg']),
    createResolver('@Query(() => String)\necho(@Arg() input: string){ return input; }', ['Query', 'Arg']),
    'class MyArgs{}\n' +
      createResolver('\n@Query(() => String)\necho(@Args() { input }: MyArgs): string { return input; }', [
        'Query',
        'Args',
      ]),
    createObjectType('@Field(() => IntAlias)\nmyNumber!: string;', { Int: 'IntAlias' }),
    'enum MyEnum {A, B}' + createObjectType('@Field(() => MyEnum)\nmyEnum!: MyEnum;'),
    "declare enum MyEnum {A = 'a', B = 'b'}" + createObjectType('@Field(() => MyEnum)\nmyEnum!: MyEnum;'),
    "enum MyEnum {A = 'a'}" + createObjectType('@Field(() => MyEnum)\nmyEnum!: MyEnum;'), // Single item enums are a special case in TypeScript
    {
      code: createObjectType('@Field(() => BigInt)\nmyInt!: number'),
      options: [
        {
          customTypes: {
            number: 'BigInt',
          },
        },
      ],
    },
    {
      code: createObjectType('@Field(() => Int)\nmyInt!: number'),
      options: [
        {
          customTypes: {
            number: ['BigInt', 'OtherType'],
          },
        },
      ],
    },
  ],
  invalid: [
    {
      code: createObjectType('@Field(() => Int)\nmyString!: string;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
    {
      code: createObjectType('@Field(() => String)\nmyNumber!: number;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
    {
      code: createObjectType('@Field(() => Int)\nmyDate!: Date;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
    {
      code: createObjectType('@Field(() => String)\nmyArray!: string[];'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
    {
      code: createObjectType('@Field(() => [String])\nmyString!: string;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
    {
      code: createObjectType('@Field(() => String, { nullable: true })\nmyString!: string;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'superfluousDecoratorNullableOption' }],
    },
    {
      code: createObjectType('@Field(() => String)\nmyString!: string | null;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'missingDecoratorNullableOption' }],
    },
    {
      code: createObjectType('@Field(() => String, { nullable: false })\nmyString?: string;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'missingDecoratorNullableOption' }],
    },
    {
      code: createObjectType("@Field(() => [String], { nullable: 'items' })\nmyString!: string[] | null;"),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorNullableOption' }],
    },
    {
      code: createObjectType("@Field(() => Int)\nget myString(){ return 'value'; }"),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
    {
      code:
        "import {MyType as MyTypeAlias} from 'mypackage';\n" +
        createObjectType('@Field(() => MyTypeAlias)\nmyString!: string;'),
      errors: [{ line: 6, column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 1, messageId: 'wrongDecoratorType' }],
    },
    {
      code: createResolver("@Query(() => Int)\nmyQuery(): string { return 'value'; }", ['Query']),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 1,
          messageId: 'wrongDecoratorType',
        },
      ],
    },
    {
      code: createResolver("@Query()\necho(@Arg('input', () => Int) input: string) { return input; }", [
        'Query',
        'Arg',
        'Int',
      ]),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 6,
          messageId: 'wrongDecoratorType',
        },
      ],
    },
    {
      code:
        'class MyArgs{}\nclass OtherArgs{}\n' +
        createResolver('@Query()\necho(@Args(() => MyArgs) { input }: OtherArgs): string { return input; }', [
          'Query',
          'Args',
        ]),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 3,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 6,
          messageId: 'wrongDecoratorType',
        },
      ],
    },
    {
      code: createObjectType("@Field(() => String, { nullable: true })\npublic myString?(){ return 'value'; }"),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
    {
      code: createObjectType('@Field(() => BigInt)\nmyInt!: number'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
    {
      code: createObjectType('@Field(() => Int)\nmyInt!: number'),
      options: [
        {
          customTypes: {
            number: ['BigInt', 'OtherType'],
          },
          replaceDefaultTypes: true,
        },
      ],
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'wrongDecoratorType' }],
    },
  ],
});
