[API](../../index.md) / [rxjs](../index.md) / Cons

# Type Alias: Cons

## Description

Constructs a new tuple with the specified type at the head.
If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.

```ts
type Cons<> = (arg: X, ...rest: Y) => any extends (...args: infer U) => any ? U : never;
```

Defined in: [rxjs/src/internal/types.ts:277](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L277)

Constructs a new tuple with the specified type at the head.
If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.
