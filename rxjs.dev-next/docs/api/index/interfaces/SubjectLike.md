[API](../../index.md) / [index](../index.md) / SubjectLike

# Interface: SubjectLike

> An object interface that defines a set of callback functions a user can use to get
> notified of any set of [Observable](../classes/Observable.md)
> guide/glossary-and-semantics#notification notification events.

## Description

For more info, please refer to guide/observer this guide.

Defined in: [internal/types.ts:223](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L223)

## Extends

- [`Observer`](Observer.md)\<`T`\>.[`Subscribable`](Subscribable.md)\<`T`\>

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="complete"></a> `complete` | () => `void` | A callback function that gets called by the producer if and when it has no more values to provide (by calling `next` callback function). This means that no error has happened. This callback can't be called more than one time, it can't be called if the `error` callback function have been called previously, nor it can't be called if the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#complete this guide. | [`Observer`](Observer.md).[`complete`](Observer.md#complete) |
| <a id="error"></a> `error` | (`err`: `any`) => `void` | A callback function that gets called by the producer if and when it encountered a problem of any kind. The errored value will be provided through the `err` parameter. This callback can't be called more than one time, it can't be called if the `complete` callback function have been called previously, nor it can't be called if the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#error this guide. | [`Observer`](Observer.md).[`error`](Observer.md#error) |
| <a id="next"></a> `next` | (`value`: `T`) => `void` | A callback function that gets called by the producer during the subscription when the producer "has" the `value`. It won't be called if `error` or `complete` callback functions have been called, nor after the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#next this guide. | [`Observer`](Observer.md).[`next`](Observer.md#next) |

## Methods

### subscribe()

```ts
subscribe(observer: Partial<Observer<T>>): Unsubscribable;
```

Defined in: [internal/types.ts:97](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L97)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `observer` | `Partial`\<[`Observer`](Observer.md)\<`T`\>\> |

#### Returns

[`Unsubscribable`](Unsubscribable.md)

#### Inherited from

[`Subscribable`](Subscribable.md).[`subscribe`](Subscribable.md#subscribe)
