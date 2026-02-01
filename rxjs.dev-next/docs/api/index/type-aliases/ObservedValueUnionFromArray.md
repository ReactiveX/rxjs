[API](../../index.md) / [index](../index.md) / ObservedValueUnionFromArray

# Type Alias: ObservedValueUnionFromArray

## Description

Extracts a union of element types from an `ObservableInput<any>[]`.
If you have `O extends ObservableInput<any>[]` and you pass in
`Observable<string>[]` or `Promise<string>[]` you would get
back a type of `string`.
If you pass in `[Observable<string>, Observable<number>]` you would
get back a type of `string | number`.

```ts
type ObservedValueUnionFromArray<> = X extends ObservableInput<infer T>[] ? T : never;
```

Defined in: [internal/types.ts:265](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L265)

Extracts a union of element types from an `ObservableInput<any>[]`.
If you have `O extends ObservableInput<any>[]` and you pass in
`Observable<string>[]` or `Promise<string>[]` you would get
back a type of `string`.
If you pass in `[Observable<string>, Observable<number>]` you would
get back a type of `string | number`.

