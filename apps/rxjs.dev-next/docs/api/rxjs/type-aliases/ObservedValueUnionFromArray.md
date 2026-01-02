[API](../../index.md) / [rxjs](../index.md) / ObservedValueUnionFromArray

# Type Alias: ObservedValueUnionFromArray

> Extracts a union of element types from an `ObservableInput<any>[]`.

## Description

If you have `O extends ObservableInput<any>[]` and you pass in
`Observable<string>[]` or `Promise<string>[]` you would get
back a type of `string`.
If you pass in `[Observable<string>, Observable<number>]` you would
get back a type of `string | number`.

```ts
type ObservedValueUnionFromArray<> = X extends ObservableInput<infer T>[] ? T : never;
```

Defined in: [rxjs/src/internal/types.ts:254](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L254)

Extracts a union of element types from an `ObservableInput<any>[]`.
If you have `O extends ObservableInput<any>[]` and you pass in
`Observable<string>[]` or `Promise<string>[]` you would get
back a type of `string`.
If you pass in `[Observable<string>, Observable<number>]` you would
get back a type of `string | number`.
