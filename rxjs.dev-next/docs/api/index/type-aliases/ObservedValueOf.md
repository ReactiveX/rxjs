[API](../../index.md) / [index](../index.md) / ObservedValueOf

# Type Alias: ObservedValueOf

## Description

Extracts the type from an `ObservableInput<any>`. If you have
`O extends ObservableInput<any>` and you pass in `Observable<number>`, or
`Promise<number>`, etc, it will type as `number`.

```ts
type ObservedValueOf<> = O extends ObservableInput<infer T> ? T : never;
```

Defined in: [internal/types.ts:255](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L255)

Extracts the type from an `ObservableInput<any>`. If you have
`O extends ObservableInput<any>` and you pass in `Observable<number>`, or
`Promise<number>`, etc, it will type as `number`.

