[API](../../index.md) / [index](../index.md) / Head

# Type Alias: Head

## Description

Extracts the head of a tuple.
If you declare `Head<[A, B, C]>` you will get back `A`.

```ts
type Head<> = (...args: X) => any extends (arg: infer U, ...rest: any[]) => any ? U : never;
```

Defined in: [internal/types.ts:299](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L299)

Extracts the head of a tuple.
If you declare `Head<[A, B, C]>` you will get back `A`.

