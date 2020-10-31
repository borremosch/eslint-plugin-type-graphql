export = {
  extends: ['./configs/base'],
  rules: {
    'type-graphql/invalid-decorated-type': 'error',
    'type-graphql/invalid-decorator-type': 'error',
    'type-graphql/invalid-nullable-input-type': 'warn',
    'type-graphql/invalid-nullable-output-type': 'warn',
    'type-graphql/missing-decorator-type': 'error',
    'type-graphql/wrong-decorator-signature': 'error',
  },
};
