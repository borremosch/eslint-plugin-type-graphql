import path from 'path';
import rule from '../../src/rules/no-missing-decorator-type';
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

const DEFAULT_ERRORS = [
  {
    messageId: 'missingDecoratorType',
    line: CREATE_OBJECT_TYPE_CODE_LINE_OFFSET,
    column: CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET + 1,
  },
];

ruleTester.run('no-missing-decorator-type', rule, {
  valid: [
    createObjectType('@Field()\nmyString!: string;'),
    createObjectType('@Field()\nmyBoolean!: boolean;'),
    createObjectType('@Field()\nmyBoolean!: boolean;'),
    createObjectType('@Field(() => Int)\nmyNumber!: number;', ['Field', 'Int']),
    createObjectType('@Field(() => String, { nullable: true })\nmyString!: string | null;'),
  ],
  invalid: [
    {
      code: createObjectType('@Field()\nmyNumber!: number;'),
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyString!: string | null;'),
      errors: DEFAULT_ERRORS,
    },
  ],
});

ruleTester.run('no-missing-decorator-type - all', rule, {
  valid: [
    {
      code: createObjectType('@Field()\nmyNumber!: number;'),
      options: ['nontrivial'],
    },
  ],
  invalid: [],
});

ruleTester.run('no-missing-decorator-type - all', rule, {
  valid: [],
  invalid: [
    {
      code: createObjectType('@Field()\nmyString!: string;'),
      options: ['all'],
      errors: DEFAULT_ERRORS,
    },
    {
      code: createObjectType('@Field()\nmyBoolean!: boolean;'),
      options: ['all'],
      errors: DEFAULT_ERRORS,
    },
  ],
});
