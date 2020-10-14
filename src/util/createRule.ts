import { ESLintUtils } from '@typescript-eslint/experimental-utils';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../package.json').version;

export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/borremosch/eslint-plugin-type-graphql/blob/v${version}/docs/rules/${name}.md`
);
