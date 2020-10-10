# Warns when a type that is used in TypeGraphQL includes `undefined`<br/>(`prefer-null-over-undefined`)

## Rule Details

GraphQL contains only a `null` type and not an `undefined` type. This rules enforces the use of `null` rather than `undefined` in the corresponding TypeScript code.

Examples of **incorrect** code for this rule:

```ts
@Field(() => String, { nullable: true })
myString!: string | undefined;
```

```ts
@Query(() => [Int], { nullable: true })
statistics(): number[] | undefined {
  return [1,2,3];
}
```

```ts
@Field(() => [Int], { true })
deletedAtTime?: number;
```

Examples of **correct** code for this rule:

```ts
@Field(() => String, { nullable: true })
myString!: string | null;
```

```ts
@Query(() => [Int], { nullable: true })
statistics(): number[] | null {
  return [1,2,3];
}
```

```ts
@Field(() => [Int], { true })
deletedAtTime!: number | null;
```
