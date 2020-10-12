import path from 'path';
import rule from '../../src/rules/invalid-decorator-type';
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

ruleTester.run('invalid-decorator-type', rule, {
  valid: [
    createObjectType('@Field(() => [String])\nmyArray!: string[];'),
    createObjectType('@Field(() => String)\nmyString!: string;'),
    createObjectType('@Field(() => [String])\nmyString!: Array<string | null>;'),
    createObjectType('@Field(() => [String])\nmyString!: Array<string | null> | null;'),
    createObjectType("@Field(() => [String])\nget myArray(){ return ['value']; }"),
    createResolver("@Query(() => String)\nmyQuery(){ return 'value'; }", ['Query']),
    createResolver('@Query(() => String)\necho(@Arg(() => String) input: string){ return input; }', ['Query', 'Arg']),
    createResolver('@Query(() => String)\necho(@Arg() input: string){ return input; }', ['Query', 'Arg']),
    'class MyArgs{}\n' +
      createResolver('\n@Query(() => String)\necho(@Args() { input }: MyArgs): string { return input; }', [
        'Query',
        'Args',
      ]),
  ],
  invalid: [
    {
      code: createObjectType('@Field(() => [String, Boolean])\nmyArray!: Array<string | boolean>;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'multiElementArray' }],
    },
    {
      code: createObjectType("@Field(() => ({ prop: 'value' }))\nmyString!: string;"),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidTypeFunction' }],
    },
    {
      code: createObjectType("@Field(() => String, { nullable: 'items' })\nmyString!: string | null;"),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidNullableValue' }],
    },
    {
      code: createObjectType("@Field(() => String, { nullable: 'itemsAndList' })\nmyString!: string | null;"),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidNullableValue' }],
    },
    {
      code: createObjectType(
        "@Field(() => [String, Boolean])\nget myArray(): Array<string | boolean> { return ['value']; }"
      ),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'multiElementArray' }],
    },
    {
      code: createResolver("@Subscription(() => ({ prop: 'value' }))\nmySubscription(){ return 'value'; }", [
        'Subscription',
      ]),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 1,
          messageId: 'invalidTypeFunction',
        },
      ],
    },
    {
      code: createResolver(
        "@Subscription(() => String)\nmySubscription(@Arg('input', () => String, { nullable: 'items' }) input: string)\n{ return input; }",
        ['Subscription', 'Arg']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 16,
          messageId: 'invalidNullableValue',
        },
      ],
    },
  ],
});
