import { indent } from './util';

export const CREATE_OBJECT_TYPE_CODE_LINE_OFFSET = 5;
export const CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET = 2;

export function createObjectType(code: string, imports = ['Field']): string {
  return `import { ObjectType, ${imports.join(', ')} } from 'type-graphql';

@ObjectType()
class MyClass{
  ${indent(code, CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET)}
}`;
}
