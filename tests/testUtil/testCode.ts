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

export const CREATE_RESOLVER_CODE_LINE_OFFSET = 5;
export const CREATE_RESOLVER_CODE_COLUMN_OFFSET = 2;

export function createResolver(code: string, imports: string[]): string {
  return `import { Resolver, ${imports.join(', ')} } from 'type-graphql'

@Resolver()
class MyResolver{
  ${indent(code, CREATE_RESOLVER_CODE_COLUMN_OFFSET)}
}`;
}
