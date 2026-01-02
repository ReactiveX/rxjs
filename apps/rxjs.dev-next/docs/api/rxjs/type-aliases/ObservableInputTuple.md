[API](../../index.md) / [rxjs](../index.md) / ObservableInputTuple

# Type Alias: ObservableInputTuple

## Description

Used to infer types from arguments to functions like [forkJoin](../functions/forkJoin.md).
So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
et al.

```ts
type ObservableInputTuple<> = { [K in keyof T]: ObservableInput<T[K]> };
```

Defined in: [rxjs/src/internal/types.ts:269](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L269)

Used to infer types from arguments to functions like [forkJoin](../functions/forkJoin.md).
So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
et al.
