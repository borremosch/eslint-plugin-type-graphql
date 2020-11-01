import invalidDecoratedType from './invalid-decorated-type';
import invalidDecoratorType from './invalid-decorator-type';
import invalidNullableOutputType from './invalid-nullable-output-type';
import invalidNullableInputType from './invalid-nullable-input-type';
import missingDecoratorType from './missing-decorator-type';
import wrongDecoratorSignature from './wrong-decorator-signature';

export default {
  'invalid-decorated-type': invalidDecoratedType,
  'invalid-decorator-type': invalidDecoratorType,
  'invalid-nullable-input-type': invalidNullableInputType,
  'invalid-nullable-output-type': invalidNullableOutputType,
  'missing-decorator-type': missingDecoratorType,
  'wrong-decorator-signature': wrongDecoratorSignature,
};
