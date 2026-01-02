[API](../../index.md) / [rxjs](../index.md) / Head

# Type Alias: Head

> Extracts the head of a tuple.

## Description

If you declare `Head<[A, B, C]>` you will get back `A`.

```ts
type Head<> = (...args: X) => any extends (arg: infer U, ...rest: any[]) => any ? U : never;
```

Defined in: [rxjs/src/internal/types.ts:283](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L283)

Extracts the head of a tuple.
If you declare `Head<[A, B, C]>` you will get back `A`.
