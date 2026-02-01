[API](../../index.md) / [index](../index.md) / SubscribableOrPromise

# ~~Type Alias: SubscribableOrPromise~~

```ts
type SubscribableOrPromise<> = 
  | Subscribable<T>
  | Subscribable<never>
  | PromiseLike<T>
| InteropObservable<T>;
```

Defined in: [internal/types.ts:92](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L92)

## Deprecated

Do not use. Most likely you want to use `ObservableInput`. Will be removed in v8.
