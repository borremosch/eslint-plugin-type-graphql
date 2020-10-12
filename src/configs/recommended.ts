export = {
  extends: ['./configs/base'],
  rules: {
    'type-graphql/invalid-decorated-type': 'error',
    'type-graphql/invalid-decorator-type': 'error',
    'type-graphql/no-missing-decorator-type': 'error',
    'type-graphql/prefer-null-over-undefined': 'warn',
    'type-graphql/wrong-decorator-signature': 'error',
  },
};
