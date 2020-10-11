# Warns when the decorator is incompatible with the decorated type<br/>(`wrong-decorator-type`)

## Rule Details

This rule will prevent inconsistencies between TypeGraphQL decorators, and the types that they are decorating.

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
