import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import path from 'path';

function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

const { batchedSingleLineTests, RuleTester, noFormat } = ESLintUtils;

export { batchedSingleLineTests, getFixturesRootDir, noFormat, RuleTester };
