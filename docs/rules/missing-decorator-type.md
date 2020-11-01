# Warns when a type argument is missing on a decorator<br/>(`missing-decorator-type`)

## Rule Details

This rule aims to prevent errors resulting from omitting type arguments in TypeGraphQL decorators

Examples of **incorrect** code for this rule:

```ts
// TypeGraphQL will not be able to deduce the GraphQL type for this complex type
@Field()
myComplexType!: Promise<MyType[] | null>
```

```ts
// The JavaScript `number` type is not specific.
// Either the `Int` or `Float` GraphQL type should be specified in the decorator
@Query()
numberOfUsers(): number{
  return 10;
}
```

Examples of **correct** code for this rule:

```ts
@Field(() => MyType, { nullable: true })
myComplexType!: Promise<MyType[] | null>
```

```ts
@Query(() => Int)
numberOfUsers(): number{
  return 10;
}
```

```ts
@Query()
getNumberOfItems(@Arg() userID: number){ // `number` is a trivial data type which needs no type argument
  return 20;
}
```

## Options

This rule optionally takes a single argument containing the strictness. Possible values are:

| value                   | description                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nontrivial`            | only require type arguments for nontrivial data types.<br/>This is the minimum required for the code to run.<br/>Number types will default to `Float` |
| `nontrivial-and-number` | default                                                                                                                                               |
| `all`                   | always require type arguments in decorators, even for trivial data types                                                                              |
