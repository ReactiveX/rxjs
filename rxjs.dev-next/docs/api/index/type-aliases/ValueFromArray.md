[API](../../index.md) / [index](../index.md) / ValueFromArray

# Type Alias: ValueFromArray

## Description

Extracts the generic value from an Array type.
If you have `T extends Array<any>`, and pass a `string[]` to it,
`ValueFromArray<T>` will return the actual type of `string`.

```ts
type ValueFromArray<> = A extends infer T[] ? T : never;
```

Defined in: [internal/types.ts:312](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L312)

Extracts the generic value from an Array type.
If you have `T extends Array<any>`, and pass a `string[]` to it,
`ValueFromArray<T>` will return the actual type of `string`.

