[API](../../index.md) / [rxjs](../index.md) / ObservedValueTupleFromArray

# Type Alias: ObservedValueTupleFromArray

## Description

Extracts a tuple of element types from an `ObservableInput<any>[]`.
If you have `O extends ObservableInput<any>[]` and you pass in
`[Observable<string>, Observable<number>]` you would get back a type
of `[string, number]`.

```ts
type ObservedValueTupleFromArray<> = { [K in keyof X]: ObservedValueOf<X[K]> };
```

Defined in: [rxjs/src/internal/types.ts:262](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L262)

Extracts a tuple of element types from an `ObservableInput<any>[]`.
If you have `O extends ObservableInput<any>[]` and you pass in
`[Observable<string>, Observable<number>]` you would get back a type
of `[string, number]`.
