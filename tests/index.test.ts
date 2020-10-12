import index from '../src/';
import fs from 'fs';
import 'jest';

const rules = Object.keys(index.rules);

describe('index.ts', () => {
  it('should expose all rules', () => {
    for (const file of fs.readdirSync('src/rules')) {
      if (file === 'index.ts') {
        continue;
      }

      // Check that rule is exported
      const ruleName = file.replace(/\.ts$/, '');
      expect(rules).toContain(ruleName);
    }
  });
});
