[API](../../index.md) / [rxjs](../index.md) / SubjectLike

# Interface: SubjectLike

> An object interface that defines a set of callback functions a user can use to get
> notified of any set of [Observable](../classes/Observable.md) > [notification](https://rxjs.dev/guide/glossary-and-semantics#notification) events.

## Description

For more info, please refer to [this \| guide](https://rxjs.dev/guide/observer).

Defined in: [rxjs/src/internal/types.ts:212](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L212)

## Extends

- [`Observer`](Observer.md)\<`T`\>.[`Subscribable`](Subscribable.md)\<`T`\>

## Properties

| Property                         | Type                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Inherited from                                               |
| -------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| <a id="complete"></a> `complete` | () => `void`             | A callback function that gets called by the producer if and when it has no more values to provide (by calling `next` callback function). This means that no error has happened. This callback can't be called more than one time, it can't be called if the `error` callback function have been called previously, nor it can't be called if the consumer has unsubscribed. For more info, please refer to [this \| guide](https://rxjs.dev/guide/glossary-and-semantics#complete). | [`Observer`](Observer.md).[`complete`](Observer.md#complete) |
| <a id="error"></a> `error`       | (`err`: `any`) => `void` | A callback function that gets called by the producer if and when it encountered a problem of any kind. The errored value will be provided through the `err` parameter. This callback can't be called more than one time, it can't be called if the `complete` callback function have been called previously, nor it can't be called if the consumer has unsubscribed. For more info, please refer to [this \| guide](https://rxjs.dev/guide/glossary-and-semantics#error).          | [`Observer`](Observer.md).[`error`](Observer.md#error)       |
| <a id="next"></a> `next`         | (`value`: `T`) => `void` | A callback function that gets called by the producer during the subscription when the producer "has" the `value`. It won't be called if `error` or `complete` callback functions have been called, nor after the consumer has unsubscribed. For more info, please refer to [this \| guide](https://rxjs.dev/guide/glossary-and-semantics#next).                                                                                                                                     | [`Observer`](Observer.md).[`next`](Observer.md#next)         |

## Methods

### subscribe()

```ts
subscribe(observer: Partial<Observer<T>>): Unsubscribable;
```

Defined in: [rxjs/src/internal/types.ts:91](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L91)

#### Parameters

| Parameter  | Type                                          |
| ---------- | --------------------------------------------- |
| `observer` | `Partial`\<[`Observer`](Observer.md)\<`T`\>\> |

#### Returns

[`Unsubscribable`](Unsubscribable.md)

#### Inherited from

[`Subscribable`](Subscribable.md).[`subscribe`](Subscribable.md#subscribe)
