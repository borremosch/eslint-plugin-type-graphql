import path from 'path';
import rule from '../../src/rules/invalid-decorated-type';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
const { RuleTester } = ESLintUtils;
import {
  createObjectType,
  CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
  CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET,
} from '../testUtil/objectType';

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
  ],
  invalid: [
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
  ],
});
