[API](../../index.md) / [index](../index.md) / Cons

# Type Alias: Cons

## Description

Constructs a new tuple with the specified type at the head.
If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.

```ts
type Cons<> = (arg: X, ...rest: Y) => any extends (...args: infer U) => any ? U : never;
```

Defined in: [internal/types.ts:293](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L293)

Constructs a new tuple with the specified type at the head.
If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.

