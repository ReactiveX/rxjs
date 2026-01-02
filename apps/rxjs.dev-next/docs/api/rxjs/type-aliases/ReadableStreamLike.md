[API](../../index.md) / [rxjs](../index.md) / ReadableStreamLike

# Type Alias: ReadableStreamLike

## Description

The base signature RxJS will look for to identify and use
a [ReadableStream](https://streams.spec.whatwg.org/#rs-class)
as an [ObservableInput](ObservableInput.md) source.

```ts
type ReadableStreamLike<> = Pick<ReadableStream<T>, 'getReader'>;
```

Defined in: [rxjs/src/internal/types.ts:323](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L323)

The base signature RxJS will look for to identify and use
a [ReadableStream](https://streams.spec.whatwg.org/#rs-class)
as an [ObservableInput](ObservableInput.md) source.
