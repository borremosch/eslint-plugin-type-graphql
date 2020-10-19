# Warns when the decorator is configured incorrectly<br/>(`invalid-decorator-type`)

## Rule Details

This rule will prevent configuration errors within TypeGraphQL decorators.

Examples of **incorrect** code for this rule:

```ts
// Specifying an array type with multiple item types is not allowed
@Field(() => [String, Boolean])
myString!: Array<string | boolean>;
```

```ts
// Type functions must specify a TypeGraphQL literal or TypeScript type
@Query(() => ({ invalid: 'type' }))
userName(): string{
  return 'John Doe';
}
```

```ts
// Invalid value of nullable option for a non-array type
@Field(() => Int, { nullable: 'items' })
deletedAtTime?: number | null;
```

Examples of **correct** code for this rule:

```ts
@Field(() => [String])
myString!: string[];
```

```ts
@Field(() => Int, { nullable: true })
deletedAtTime?: number | null;
```

```ts
@Field(() => [Int], { nullable: 'items' })
timestamps?: Array<number | null>;
```
