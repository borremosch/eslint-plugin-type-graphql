import { indent } from './util';

export const CREATE_OBJECT_TYPE_CODE_LINE_OFFSET = 5;
export const CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET = 2;

type Imports = string[] | { [key: string]: string };

function getImportString(imports: Imports): string {
  if (Array.isArray(imports)) {
    return imports.join(', ');
  } else {
    return Object.entries(imports)
      .map(([key, value]) => `${key} as ${value}`)
      .join(', ');
  }
}

export function createObjectType(code: string, imports: Imports = ['Field']): string {
  return `import { ObjectType, ${getImportString(imports)} } from 'type-graphql';

@ObjectType()
class MyClass{
  ${indent(code, CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET)}
}`;
}

export const CREATE_RESOLVER_CODE_LINE_OFFSET = 5;
export const CREATE_RESOLVER_CODE_COLUMN_OFFSET = 2;

export function createResolver(code: string, imports: Imports): string {
  return `import { Resolver, ${getImportString(imports)} } from 'type-graphql'

@Resolver()
class MyResolver{
  ${indent(code, CREATE_RESOLVER_CODE_COLUMN_OFFSET)}
}`;
}
