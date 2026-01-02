[API](../../index.md) / [rxjs](../index.md) / Tail

# Type Alias: Tail

## Description

Extracts the tail of a tuple.
If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.

```ts
type Tail<> = (...args: X) => any extends (arg: any, ...rest: infer U) => any ? U : never;
```

Defined in: [rxjs/src/internal/types.ts:289](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L289)

Extracts the tail of a tuple.
If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.
