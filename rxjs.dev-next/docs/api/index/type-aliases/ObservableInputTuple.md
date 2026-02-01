[API](../../index.md) / [index](../index.md) / ObservableInputTuple

# Type Alias: ObservableInputTuple

## Description

Used to infer types from arguments to functions like [forkJoin](../functions/forkJoin.md).
So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
et al.

```ts
type ObservableInputTuple<> = { [K in keyof T]: ObservableInput<T[K]> };
```

Defined in: [internal/types.ts:285](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L285)

Used to infer types from arguments to functions like [forkJoin](../functions/forkJoin.md).
So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
et al.

