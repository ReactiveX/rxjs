[API](../../index.md) / [rxjs](../index.md) / ObservedValueOf

# Type Alias: ObservedValueOf

> Extracts the type from an `ObservableInput<any>`.

## Description

If you have
`O extends ObservableInput<any>` and you pass in `Observable<number>`, or
`Promise<number>`, etc, it will type as `number`.

```ts
type ObservedValueOf<> = O extends ObservableInput<infer T> ? T : never;
```

Defined in: [rxjs/src/internal/types.ts:244](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L244)

Extracts the type from an `ObservableInput<any>`. If you have
`O extends ObservableInput<any>` and you pass in `Observable<number>`, or
`Promise<number>`, etc, it will type as `number`.
