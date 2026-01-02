[API](../../index.md) / [rxjs](../index.md) / ValueFromArray

# Type Alias: ValueFromArray

## Description

Extracts the generic value from an Array type.
If you have `T extends Array<any>`, and pass a `string[]` to it,
`ValueFromArray<T>` will return the actual type of `string`.

```ts
type ValueFromArray<> = A extends infer T[] ? T : never;
```

Defined in: [rxjs/src/internal/types.ts:296](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L296)

Extracts the generic value from an Array type.
If you have `T extends Array<any>`, and pass a `string[]` to it,
`ValueFromArray<T>` will return the actual type of `string`.
