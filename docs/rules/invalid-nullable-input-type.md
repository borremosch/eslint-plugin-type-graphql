# Prevent invalid types on nullable input types<br/>(`invalid-nullable-input-type`)

## Rule Details

GraphQL contains only a `null` type and not an `undefined` type. Whether a received input in JavaScript is `undefined` or `null` depends on the server implementation. Because assuming input values to be either `null` or `undefined` is dangerous, this rules warns when an input type is not defined as `Type | null | undefined`.

Examples of **incorrect** code for this rule:

```ts
@InputType()
class MyInputType {
  @Field(() => String, { nullable: true })
  myString!: string | undefined;
}
```

```ts
@ArgsType()
class MyArgsType {
  @Field(() => String, { nullable: true })
  myString!: string | null;
}
```

```ts
class MyResolver {
  @Query(() => String)
  getUserName(@Arg('userId', () => String, { nullable: true }) userId: string | null) {
    return 'John doe';
  }
}
```

Examples of **correct** code for this rule:

```ts
@InputType()
class MyInputType {
  @Field(() => String, { nullable: true })
  myString!: string | null | undefined;
}
```

```ts
@ArgsType()
class MyArgsType {
  @Field(() => String, { nullable: true })
  myString!: string | null | undefined;
}
```

```ts
class MyResolver {
  @Query(() => String)
  getUserName(@Arg('userId', () => String, { nullable: true }) userId: string | null | undefined) {
    return 'John doe';
  }
}
```
