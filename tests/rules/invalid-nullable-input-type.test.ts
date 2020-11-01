import path from 'path';
import rule from '../../src/rules/invalid-nullable-input-type';
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

ruleTester.run('invalid-nullable-input-type', rule, {
  valid: [
    createObjectType('@Field()\nmyString!: string;'),
    createObjectType('@Field()\nmyString!: string | null;'),
    createObjectType('@Field()\nmyString!: string | undefined;'),
    createObjectType('@Field()\nmyString!: string | null | undefined;'),
    createObjectType('@Field()\nmyArray!: string[];'),
    createObjectType('@Field()\nmyArray!: string[] | null;'),
    createObjectType('@Field()\nmyArray!: string[] | undefined;'),
    createObjectType('@Field()\nmyArray!: string[] | null | undefined;'),
    createObjectType('@Field()\nmyArray!: Array<string>;'),
    createObjectType('@Field()\nmyArray!: Array<string | null>;'),
    createObjectType('@Field()\nmyArray!: Array<string | undefined>;'),
    createObjectType('@Field()\nmyArray!: Array<string | null | undefined>;'),
    createObjectType('@Field()\nmyArray!: Array<string> | null;'),
    createObjectType('@Field()\nmyArray!: Array<string> | undefined;'),
    createObjectType('@Field()\nmyArray!: Array<string> | null | undefined;'),
    createObjectType('@Field()\nmyArray!: Array<string | null> | null;'),
    createObjectType('@Field()\nmyArray!: Array<string | undefined> | undefined;'),
    createObjectType('@Field()\nmyArray!: Array<string | null | undefined> | null | undefined;'),
    createObjectType("@Field()\nget myString(){ return 'value'; }"),
    createObjectType('@Field()\nmyString!: any;'),

    createInputType('@Field(() => String, { nullable: true })\nmyString!: string | null | undefined;'),
    createInputType('@Field(() => [String], { nullable: true })\nmyString!: string | null | undefined;'),
    createInputType('@Field(() => String, { nullable: true })\nmyString?: string | null;'),
    createInputType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | null | undefined;'),
    createArgsType('@Field(() => [String], { nullable: true })\nmyArray?: string[] | null;'),
    createArgsType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | null | undefined>;"),
    createArgsType(
      "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | null | undefined> | null | undefined;"
    ),
    createArgsType(
      "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray?: Array<string | null | undefined> | null;"
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
    `import { InputType, Field } from 'type-graphql';

@InputType
class MyClass{
  @Field(() => String, { nullable: true })
  myString!: string | null | undefined;
}`,
    `import { Field } from 'type-graphql';

class MyClass{
  @Field(() => String, { nullable: true })
  myString!: string | null | undefined;
}`,
    `import { Field } from 'type-graphql';

@UnknownOperator()
class MyClass{
  @Field(() => String, { nullable: true })
  myString!: string | null | undefined;
}`,
  ],
  invalid: [
    {
      code: createInputType('@Field(() => String, { nullable: true })\nmyString!: string | null;'),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 12,
        },
      ],
    },
    {
      code: createArgsType('@Field(() => String, { nullable: true })\nmyString!: string | undefined;'),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 12,
        },
      ],
    },
    {
      code: createInputType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | null;'),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
        },
      ],
    },
    {
      code: createArgsType('@Field(() => [String], { nullable: true })\nmyArray!: string[] | undefined;'),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
        },
      ],
    },
    {
      code: createInputType('@Field(() => [String], { nullable: true })\nmyArray?: string[];'),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
        },
      ],
    },
    {
      code: createArgsType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | null>;"),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
        },
      ],
    },
    {
      code: createInputType("@Field(() => [String], { nullable: 'items' })\nmyArray!: Array<string | undefined>;"),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
        },
      ],
    },
    {
      code: createArgsType(
        "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | null | undefined> | undefined;"
      ),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
        },
      ],
    },
    {
      code: createInputType(
        "@Field(() => [String], { nullable: 'itemsAndList' })\nmyArray!: Array<string | undefined> | null | undefined;"
      ),
      errors: [
        {
          messageId: 'invalidNullableInputType',
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
        },
      ],
    },
    {
      code: createResolver(
        "@Query(() => String, { nullable: true })\nmyQuery(@Arg('myString', () => String, { nullable: true }) myString: string | undefined): string | null{ return 'value'; }",
        ['Query', 'Arg']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 70,
          messageId: 'invalidNullableInputType',
        },
      ],
    },
    {
      code: createResolver(
        "@Query(() => String, { nullable: true })\nmyQuery(@Arg('myString', () => [String], { nullable: 'items' }) myString: Array<string | null>): string | null{ return 'value'; }",
        ['Query', 'Arg']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 75,
          messageId: 'invalidNullableInputType',
        },
      ],
    },
    {
      code:
        'type MyArgsType = {};\n' +
        createResolver(
          "@Query(() => String, { nullable: true })\nmyQuery(@Args(() => MyArgsType, { nullable: true }) myArgs: MyArgsType | null): string | null{ return 'value'; }",
          ['Query', 'Args']
        ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 2,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 61,
          messageId: 'invalidNullableInputType',
        },
      ],
    },
  ],
});
