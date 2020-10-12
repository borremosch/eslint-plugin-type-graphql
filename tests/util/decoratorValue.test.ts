import { TSESTree } from '@typescript-eslint/experimental-utils';
import { parse } from '@typescript-eslint/parser';
import { getNullablePropertyValue } from '../../src/util/decoratorValue';

function getObjectExpression(code: string): TSESTree.Expression {
  const expressionStatement = parse(`save(${code})`).body[0] as TSESTree.ExpressionStatement;
  const callExpression = expressionStatement.expression as TSESTree.CallExpression;
  const objectExpression = callExpression.arguments[0] as TSESTree.ObjectExpression;

  return objectExpression;
}

describe('getNullablePropertyValue', () => {
  it('should get a boolean value', () => {
    expect(getNullablePropertyValue(getObjectExpression('{ nullable: true }'))).toEqual(true);
  });

  it('should get a string value', () => {
    expect(getNullablePropertyValue(getObjectExpression("{ nullable: 'items' }"))).toEqual('items');
  });

  it('should default to false for an unsupported value', () => {
    expect(getNullablePropertyValue(getObjectExpression("{ nullable: 'always' }"))).toEqual(false);
  });

  it('should ignore other config values', () => {
    expect(getNullablePropertyValue(getObjectExpression("{ name: 'nullable', nullable: true }"))).toEqual(true);
  });
});
