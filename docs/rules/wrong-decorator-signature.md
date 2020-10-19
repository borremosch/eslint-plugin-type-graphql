# Warns when the decorator is incompatible with the decorated type<br/>(`wrong-decorator-signature`)

## Rule Details

This rule will prevent inconsistencies between TypeGraphQL decorators, and the types that they are decorating.

## Options

```ts
type Options = {
  customTypes: {
    [key: string]: string | string[];
  };
};
```

The rule accepts a single object as options, with the following key:

- `customTypes`: this object may contain a mapping between TypeScript types and custom GraphQL types. the keys in the object are TypeScript names, and the values in the object are a string or array of strings of custom GraphQL types that they may be mapped to.

Example configuration:

```json
{
  "type-graphql/wrong-decorator-signature": [
    "error",
    {
      "number": "BigInt"
    }
  ]
}
```

### Examples

Examples of **incorrect** code for this rule:

```ts
// Decorator specifies string array, decorated type is string
@Field(() => [String])
myString!: string;
```

```ts
// Decorator specifies non-nullable string, decorated type is nullable string
@Query(() => String)
userName(): string | null{
  return null;
}
```

Examples of **correct** code for this rule:

```ts
@Field(() => Int, { nullable: true })
myNumber!: number | null
```

```ts
@Query(() => Boolean)
isLoggedIn(): boolean{
  return true;
}
```
