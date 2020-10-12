import path from 'path';
import rule from '../../src/rules/invalid-decorated-type';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
const { RuleTester } = ESLintUtils;
import {
  createObjectType,
  createResolver,
  CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
  CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET,
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

ruleTester.run('invalid-decorated-type', rule, {
  valid: [
    createObjectType('@Field(() => String)\nmyString!: string;'),
    createObjectType('@Field(() => [String])\nmyString!: string[];'),
    createObjectType('@Field(() => [String], { nullable: true })\nmyString!: string[] | null;'),
    createObjectType("@Field(() => [String], { nullable: 'items' })\nmyString!: Array<string | null>;"),
    createObjectType("@Field(() => [String], { nullable: 'itemsAndList' })\nmyString!: Array<string | null> | null;"),
    createObjectType('@Field(() => [String])\nmyPromisedArray!: Promise<Array<string>>;'),
    createObjectType("@Field(() => String)\nget myString() { return 'value'; }"),
    createResolver("@Query(() => String)\nmyQuery(){ return 'value'; }", ['Query']),
    createResolver('@Query(() => String)\necho(@Arg() input: string){ return input; }', ['Query', 'Arg']),
    'class MyArgs{}\n' +
      createResolver('\n@Query(() => String)\necho(@Args() { input }: MyArgs): string { return input; }', [
        'Query',
        'Args',
      ]),
  ],
  invalid: [
    {
      code: createObjectType('@Field()\nmyUnion!: unknown;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidDecoratedType' }],
    },
    {
      code: createObjectType('@Field()\nmyUnion!: string | boolean;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidDecoratedType' }],
    },
    {
      code: createObjectType('@Field()\nmyArrayOfPromises!: Array<Promise<string>>;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidDecoratedType' }],
    },
    {
      code: createObjectType('@Field()\nmyArrayOfArrays!: string[][];'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidDecoratedType' }],
    },
    {
      code: createObjectType('@Field()\nmyArrayOfArrays!: Promise<string[][]>;'),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidDecoratedType' }],
    },
    {
      code: createObjectType("@Field()\nget myUnion(): string | boolean { return 'value'; }"),
      errors: [{ ...DEFAULT_ERROR_LOCATION, messageId: 'invalidDecoratedType' }],
    },
    {
      code: createResolver(
        "@Mutation(() => [String])\nmyMutation(): Array<Promise<string>>{ return [Promise.resolve('value')]; }",
        ['Mutation']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 1,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
    {
      code: createResolver(
        "@Mutation(() => String)\nmyMutation(@Arg('myArg', () => [[Int]]) coordinates: number[][]): string { return 'value'; }",
        ['Mutation', 'Arg']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 12,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
    {
      code: createResolver(
        "@Mutation(() => String)\nmyMutation(@Arg('myArg', () => [[Int]]) coordinates: number[][]): string { return 'value'; }",
        ['Mutation', 'Arg']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 12,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
    {
      code:
        'class CartesianCoordinates{}\nclass PolarCoordinates{}\n' +
        createResolver(
          "@Mutation(() => String)\nmyMutation(@Args() { coordinates }: CartesianCoordinates | PolarCoordinates): string { return 'value'; }",
          ['Mutation', 'Args']
        ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 3,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 12,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
  ],
});
