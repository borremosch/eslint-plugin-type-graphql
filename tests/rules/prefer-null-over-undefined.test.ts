import path from 'path';
import rule from '../../src/rules/prefer-null-over-undefined';
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
  ],
});
