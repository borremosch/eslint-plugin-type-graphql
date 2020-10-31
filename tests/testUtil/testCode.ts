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

function createClass(decoratorName: string, code: string, imports: Imports): string {
  return `import { ${decoratorName}, ${getImportString(imports)} } from 'type-graphql';

@${decoratorName}()
class MyClass{
  ${indent(code, CREATE_OBJECT_TYPE_CODE_COLUMN_OFFSET)}
}`;
}

export function createObjectType(code: string, imports: Imports = ['Field']): string {
  return createClass('ObjectType', code, imports);
}

export function createInputType(code: string, imports: Imports = ['Field']): string {
  return createClass('InputType', code, imports);
}

export function createArgsType(code: string, imports: Imports = ['Field']): string {
  return createClass('ArgsType', code, imports);
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
