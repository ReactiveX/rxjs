[API](../../index.md) / [index](../index.md) / ObservedValueTupleFromArray

# Type Alias: ObservedValueTupleFromArray

## Description

Extracts a tuple of element types from an `ObservableInput<any>[]`.
If you have `O extends ObservableInput<any>[]` and you pass in
`[Observable<string>, Observable<number>]` you would get back a type
of `[string, number]`.

```ts
type ObservedValueTupleFromArray<> = { [K in keyof X]: ObservedValueOf<X[K]> };
```

Defined in: [internal/types.ts:278](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L278)

Extracts a tuple of element types from an `ObservableInput<any>[]`.
If you have `O extends ObservableInput<any>[]` and you pass in
`[Observable<string>, Observable<number>]` you would get back a type
of `[string, number]`.

