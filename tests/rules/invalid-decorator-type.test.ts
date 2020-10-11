import path from 'path';
import rule from '../../src/rules/invalid-decorator-type';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
const { RuleTester } = ESLintUtils;
import {
  createObjectType,
  CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
  CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET,
} from '../util/objectType';

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
  ],
});
