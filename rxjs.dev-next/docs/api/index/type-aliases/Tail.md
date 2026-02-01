[API](../../index.md) / [index](../index.md) / Tail

# Type Alias: Tail

## Description

Extracts the tail of a tuple.
If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.

```ts
type Tail<> = (...args: X) => any extends (arg: any, ...rest: infer U) => any ? U : never;
```

Defined in: [internal/types.ts:305](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L305)

Extracts the tail of a tuple.
If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.

