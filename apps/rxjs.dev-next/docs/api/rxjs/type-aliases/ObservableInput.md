[API](../../index.md) / [rxjs](../index.md) / ObservableInput

# Type Alias: ObservableInput

## Description

Valid types that can be converted to observables.

```ts
type ObservableInput<> =
  | Observable<T>
  | InteropObservable<T>
  | AsyncIterable<T>
  | PromiseLike<T>
  | ArrayLike<T>
  | Iterable<T>
  | ReadableStreamLike<T>;
```

Defined in: [rxjs/src/internal/types.ts:97](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L97)

Valid types that can be converted to observables.
