[API](../../index.md) / [index](../index.md) / ObservableInput

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

Defined in: [internal/types.ts:103](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L103)

Valid types that can be converted to observables.

