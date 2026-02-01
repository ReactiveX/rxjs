[API](../../index.md) / [index](../index.md) / ReadableStreamLike

# Interface: ReadableStreamLike

## Description

The base signature RxJS will look for to identify and use
a [ReadableStream](https://streams.spec.whatwg.org/#rs-class)
as an [ObservableInput](../type-aliases/ObservableInput.md) source.

Defined in: [internal/types.ts:355](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L355)

The base signature RxJS will look for to identify and use
a [ReadableStream](https://streams.spec.whatwg.org/#rs-class)
as an [ObservableInput](../type-aliases/ObservableInput.md) source.

## Methods

### getReader()

```ts
getReader(): ReadableStreamDefaultReaderLike<T>;
```

Defined in: [internal/types.ts:356](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L356)

#### Returns

`ReadableStreamDefaultReaderLike`\<`T`\>
