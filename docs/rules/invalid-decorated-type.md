# Warns when the decorator is configured incorrectly<br/>(`invalid-decorated-type`)

## Rule Details

This rule will warn when a type is decorated with TypeGraphQL that is not expressable in GraphQL.

Examples of **incorrect** code for this rule:

```ts
// Union types are only supported in GraphQL when made explicit using TypeGraphQL unions
@Field()
myUnion!: string | boolean;
```

```ts
// Two dimensional arrays require nested objects
@Query(() => [[Float]])
coordinates(): number[][]{
  return [
    [0, 0.5],
    [5.2, 1.2]
  ];
}
```

Examples of **correct** code for this rule:

```ts
// Inside MyUnion.ts
const MyUnion = createUnionType({
  name: "MyUnion",
  types: () => [MyType1, MyType2] as const
})

// Inside other class
@Field(() => MyUnion)
myUnion!: MyUnion;
```

```ts
// Inside Coordinate.ts
@ObjectType()
class Coordinate{
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;
}

// Inside resolver
@Query(() => [Coordinate])
coordinates(){
  return [
    { x: 0, y: 0.5 },
    { x: 5.2, y: 1.2 }
  ];
}
```
