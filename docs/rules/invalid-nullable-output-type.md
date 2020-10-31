# Prevent invalid types on nullable output types<br/>(`invalid-nullable-output-type`)

## Rule Details

In most GraphqL implementations in JavaScript, returning `undefined` or `null` for a nullable field is both valid. However, since returning `null` is both more in line with with GraphQL spec, as well as safer (omitting a null valid will yield a compilation error), this rule will enforce nullable output types to be defined as `Type | null`.

Examples of **incorrect** code for this rule:

```ts
@ObjectType()
class MyInputType {
  @Field(() => String, { nullable: true })
  myString!: string | undefined;
}
```

```ts
@ObjectType()
class MyArgsType {
  @Field(() => String, { nullable: true })
  myString!: string | null | undefined;
}
```

```ts
class MyResolver {
  @Query(() => String, { nullable: true })
  getUserName(): string | undefined {
    return 'John doe';
  }
}
```

Examples of **correct** code for this rule:

```ts
@ObjectType()
class MyInputType {
  @Field(() => String, { nullable: true })
  myString!: string | null;
}
```

```ts
class MyResolver {
  @Query(() => String, { nullable: true })
  getUserName(): string | null {
    return 'John doe';
  }
}
```
