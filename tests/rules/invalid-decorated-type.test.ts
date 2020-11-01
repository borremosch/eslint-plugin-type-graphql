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

ruleTester.run('invalid-decorated-type', rule, {
  valid: [
    createObjectType('@Field(() => String)\nmyString!: string;'),
    createObjectType('@Field(() => [String])\nmyString!: string[];'),
    createObjectType('@Field(() => [String], { nullable: true })\nmyString!: string[] | null;'),
    createObjectType("@Field(() => [String], { nullable: 'items' })\nmyString!: Array<string | null>;"),
    createObjectType("@Field(() => [String], { nullable: 'itemsAndList' })\nmyString!: Array<string | null> | null;"),
    createObjectType('@Field(() => [String])\nmyPromisedArray!: Promise<Array<string>>;'),
    createObjectType("@Field(() => String)\nget myString() { return 'value'; }"),
    createObjectType('@Field(() => Boolean, { nullable: true })\nbooleanValue!: boolean | null;'),
    'enum MyEnum {A, B}' + createObjectType('@Field(() => MyEnum)\nmyEnum!: MyEnum;'),
    "declare enum MyEnum {A = 'a', B = 'b'}" + createObjectType('@Field(() => MyEnum)\nmyEnum!: MyEnum;'),
    "declare enum MyEnum {A = 'a', B = 'b'}" +
      createObjectType('@Field(() => MyEnum, { nullable: true })\nmyEnum!: MyEnum | null;'),
    "declare enum MyEnum {A = 'a'}" + createObjectType('@Field(() => MyEnum)\nmyEnum!: MyEnum;'),
    createObjectType('@Field(() => MyEnum, { nullable: true })\nmyEnum!: MyEnum | null | undefined;'),
    "declare enum MyEnum {A = 'a'}" + createObjectType('@Field(() => MyEnum)\nmyEnum!: MyEnum;'),
    createResolver("@Query(() => String)\nmyQuery(){ return 'value'; }", ['Query']),
    createResolver('@Query(() => String)\necho(@Arg() input: string){ return input; }', ['Query', 'Arg']),
    'class MyArgs{}\n' +
      createResolver('@Query(() => String)\necho(@Args() { input }: MyArgs): string { return input; }', [
        'Query',
        'Args',
      ]),
    `import {ObjectType, Field} from 'type-graphql';
declare function createUnionType<T>(): T;
class MyType1 {}
class MyType2 {}
const MyUnionType: MyType1 | MyType2 = createUnionType<MyType1 | MyType2>();
@ObjectType()
class MyClass {
  @Field(() => MyUnionType)
  myField!: typeof MyUnionType;
}`,
    `import { Resolver, Query } from 'type-graphql';
declare function createUnionType<T>(): T;
class MyType1 {}
class MyType2 {}
const MyUnionType: MyType1 | MyType2 = createUnionType<MyType1 | MyType2>();
@Resolver()
class MyResolver {
  @Query(() => MyUnionType)
  myQuery(): typeof MyUnionType{}
}`,
    `import {ObjectType, Field} from 'type-graphql';
declare function createUnionType<T>(): T;
class MyType1 {}
class MyType2 {}
const MyUnionType: MyType1 | MyType2 = createUnionType<MyType1 | MyType2>();
@ObjectType()
class MyClass {
  @Field(() => [MyUnionType])
  myField!: Array<typeof MyUnionType>;
}`,
    `import { Resolver, Query } from 'type-graphql';
declare function createUnionType<T>(): T;
class MyType1 {}
class MyType2 {}
const MyUnionType: MyType1 | MyType2 = createUnionType<MyType1 | MyType2>();
@Resolver()
class MyResolver {
  @Query(() => MyUnionType)
  myQuery(): Promise<typeof MyUnionType>{}
}`,
    createObjectType('@Field(() => Array)\nmyString!: Array;'), // Should be caught by TS compiler rather than plugin
    createObjectType('@Field()\nmyField;'), // Should be caught by TS compiler rather than plugin
  ],
  invalid: [
    {
      code: createObjectType('@Field()\nmyUnion!: unknown;'),
      errors: [
        {
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
    {
      code: createObjectType('@Field()\nmyUnion!: undefined | null;'),
      errors: [
        {
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
    {
      code: createObjectType('@Field()\nmyUnion!: string | boolean;'),
      errors: [
        {
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 11,
          messageId: 'unionType',
        },
      ],
    },
    {
      code: createObjectType('@Field()\nmyArrayOfPromises!: Array<Promise<string>>;'),
      errors: [
        {
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 21,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
    {
      code: createObjectType('@Field()\nmyArrayOfArrays!: string[][];'),
      errors: [
        {
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 19,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
    {
      code: createObjectType('@Field()\nmyArrayOfArrays!: Promise<string[][]>;'),
      errors: [
        {
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 19,
          messageId: 'invalidDecoratedType',
        },
      ],
    },
    {
      code: createObjectType("@Field()\nget myUnion(): string | boolean { return 'value'; }"),
      errors: [
        {
          line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET + 1,
          column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 16,
          messageId: 'unionType',
        },
      ],
    },
    {
      code: createResolver(
        "@Mutation(() => [String])\nmyMutation(): Array<Promise<string>>{ return [Promise.resolve('value')]; }",
        ['Mutation']
      ),
      errors: [
        {
          line: CREATE_RESOLVER_CODE_LINE_OFFSET + 1,
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 15,
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
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 54,
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
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 54,
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
          column: CREATE_RESOLVER_CODE_COLUMN_OFFSET + 37,
          messageId: 'unionType',
        },
      ],
    },
    {
      code: `import {ObjectType, Field} from 'type-graphql';
declare function createUnionType<T>(): T;
class MyType1 {}
class MyType2 {}
const MyUnionType: MyType1 | MyType2 = createUnionType<MyType1 | MyType2>();
@ObjectType()
class MyClass {
  @Field(() => MyUnionType)
  myField!: MyType1 | MyType2;
}`,
      errors: [
        {
          line: 9,
          column: 13,
          messageId: 'unionType',
        },
      ],
    },
    {
      code: `import { Resolver, Query } from 'type-graphql';
declare function createUnionType<T>(): T;
class MyType1 {}
class MyType2 {}
const MyUnionType: MyType1 | MyType2 = createUnionType<MyType1 | MyType2>();
@Resolver()
class MyResolver {
  @Query(() => MyUnionType)
  myQuery(): MyType1 | MyType2{}
}`,
      errors: [
        {
          line: 9,
          column: 14,
          messageId: 'unionType',
        },
      ],
    },
    {
      code: `import {ObjectType, Field} from 'type-graphql';
declare function createUnionType<T>(): T;
class MyType1 {}
class MyType2 {}
const MyUnionType: MyType1 | MyType2 = createUnionType<MyType1 | MyType2>();
@ObjectType()
class MyClass {
  @Field(() => [MyUnionType])
  myField!: Array<MyType1 | MyType2>;
}`,
      errors: [
        {
          line: 9,
          column: 13,
          messageId: 'unionType',
        },
      ],
    },
    {
      code: `import { Resolver, Query } from 'type-graphql';
declare function createUnionType<T>(): T;
class MyType1 {}
class MyType2 {}
const MyUnionType: MyType1 | MyType2 = createUnionType<MyType1 | MyType2>();
@Resolver()
class MyResolver {
  @Query(() => MyUnionType)
  myQuery(): Promise<MyType1 | MyType2>{}
}`,
      errors: [
        {
          line: 9,
          column: 14,
          messageId: 'unionType',
        },
      ],
    },
  ],
});
