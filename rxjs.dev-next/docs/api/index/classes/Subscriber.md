[API](../../index.md) / [index](../index.md) / Subscriber

# Class: Subscriber

## Description

Implements the [Observer](../interfaces/Observer.md) interface and extends the
[Subscription](Subscription.md) class. While the [Observer](../interfaces/Observer.md) is the public API for
consuming the values of an [Observable](Observable.md), all Observers get converted to
a Subscriber, in order to provide Subscription-like capabilities such as
`unsubscribe`. Subscriber is a common type in RxJS, and crucial for
implementing operators, but it is rarely used as a public API.

Defined in: [internal/Subscriber.ts:19](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscriber.ts#L19)

Implements the [Observer](../interfaces/Observer.md) interface and extends the
[Subscription](Subscription.md) class. While the [Observer](../interfaces/Observer.md) is the public API for
consuming the values of an [Observable](Observable.md), all Observers get converted to
a Subscriber, in order to provide Subscription-like capabilities such as
`unsubscribe`. Subscriber is a common type in RxJS, and crucial for
implementing operators, but it is rarely used as a public API.

## Extends

- [`Subscription`](Subscription.md)

## Implements

- [`Observer`](../interfaces/Observer.md)\<`T`\>

## Constructors

### Constructor

```ts
new Subscriber<>(destination?: Subscriber<any> | Observer<any>): Subscriber<T>;
```

Defined in: [internal/Subscriber.ts:47](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscriber.ts#L47)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `destination?` | `Subscriber`\<`any`\> \| [`Observer`](../interfaces/Observer.md)\<`any`\> |

#### Returns

`Subscriber`\<`T`\>

#### Deprecated

Internal implementation detail, do not use directly. Will be made internal in v8.
There is no reason to directly create an instance of Subscriber. This type is exported for typings reasons.

#### Overrides

[`Subscription`](Subscription.md).[`constructor`](Subscription.md#constructor)

## Properties

| Property | Type | Default value | Description | Inherited from |
| ------ | ------ | ------ | ------ | ------ |
| <a id="closed"></a> `closed` | `boolean` | `false` | A flag to indicate whether this Subscription has already been unsubscribed. | [`Subscription`](Subscription.md).[`closed`](Subscription.md#closed) |
| <a id="empty"></a> `EMPTY` | [`Subscription`](Subscription.md) | `undefined` | - | [`Subscription`](Subscription.md).[`EMPTY`](Subscription.md#empty) |

## Methods

### add()

```ts
add(teardown: TeardownLogic): void;
```

Defined in: [internal/Subscription.ts:116](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscription.ts#L116)

Adds a finalizer to this subscription, so that finalization will be unsubscribed/called
when this subscription is unsubscribed. If this subscription is already #closed,
because it has already been unsubscribed, then whatever finalizer is passed to it
will automatically be executed (unless the finalizer itself is also a closed subscription).

Closed Subscriptions cannot be added as finalizers to any subscription. Adding a closed
subscription to a any subscription will result in no operation. (A noop).

Adding a subscription to itself, or adding `null` or `undefined` will not perform any
operation at all. (A noop).

`Subscription` instances that are added to this instance will automatically remove themselves
if they are unsubscribed. Functions and [Unsubscribable](../interfaces/Unsubscribable.md) objects that you wish to remove
will need to be removed manually with #remove

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `teardown` | [`TeardownLogic`](../type-aliases/TeardownLogic.md) | The finalization logic to add to this subscription. |

#### Returns

`void`

#### Inherited from

[`Subscription`](Subscription.md).[`add`](Subscription.md#add)

### complete()

```ts
complete(): void;
```

Defined in: [internal/Subscriber.ts:95](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscriber.ts#L95)

The [Observer](../interfaces/Observer.md) callback to receive a valueless notification of type
`complete` from the Observable. Notifies the Observer that the Observable
has finished sending push-based notifications.

#### Returns

`void`

#### Implementation of

[`Observer`](../interfaces/Observer.md).[`complete`](../interfaces/Observer.md#complete)

### error()

```ts
error(err?: any): void;
```

Defined in: [internal/Subscriber.ts:81](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscriber.ts#L81)

The [Observer](../interfaces/Observer.md) callback to receive notifications of type `error` from
the Observable, with an attached `Error`. Notifies the Observer that
the Observable has experienced an error condition.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err?` | `any` | The `error` exception. |

#### Returns

`void`

#### Implementation of

[`Observer`](../interfaces/Observer.md).[`error`](../interfaces/Observer.md#error)

### next()

```ts
next(value: T): void;
```

Defined in: [internal/Subscriber.ts:67](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscriber.ts#L67)

The [Observer](../interfaces/Observer.md) callback to receive notifications of type `next` from
the Observable, with a value. The Observable may call this method 0 or more
times.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `T` | The `next` value. |

#### Returns

`void`

#### Implementation of

[`Observer`](../interfaces/Observer.md).[`next`](../interfaces/Observer.md#next)

### remove()

```ts
remove(teardown: 
  | Subscription
  | Unsubscribable
  | () => void): void;
```

Defined in: [internal/Subscription.ts:187](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscription.ts#L187)

Removes a finalizer from this subscription that was previously added with the #add method.

Note that `Subscription` instances, when unsubscribed, will automatically remove themselves
from every other `Subscription` they have been added to. This means that using the `remove` method
is not a common thing and should be used thoughtfully.

If you add the same finalizer instance of a function or an unsubscribable object to a `Subscription` instance
more than once, you will need to call `remove` the same number of times to remove all instances.

All finalizer instances are removed to free up memory upon unsubscription.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `teardown` | \| [`Subscription`](Subscription.md) \| [`Unsubscribable`](../interfaces/Unsubscribable.md) \| () => `void` | The finalizer to remove from this subscription |

#### Returns

`void`

#### Inherited from

[`Subscription`](Subscription.md).[`remove`](Subscription.md#remove)

### unsubscribe()

```ts
unsubscribe(): void;
```

Defined in: [internal/Subscriber.ts:104](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscriber.ts#L104)

Disposes the resources held by the subscription. May, for instance, cancel
an ongoing Observable execution or cancel any other type of work that
started when the Subscription was created.

#### Returns

`void`

#### Overrides

[`Subscription`](Subscription.md).[`unsubscribe`](Subscription.md#unsubscribe)

### ~~create()~~

```ts
static create<>(
   next?: (x?: T) => void, 
   error?: (e?: any) => void, 
complete?: () => void): Subscriber<T>;
```

Defined in: [internal/Subscriber.ts:34](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subscriber.ts#L34)

A static factory for a Subscriber, given a (potentially partial) definition
of an Observer.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next?` | (`x?`: `T`) => `void` | The `next` callback of an Observer. |
| `error?` | (`e?`: `any`) => `void` | The `error` callback of an Observer. |
| `complete?` | () => `void` | The `complete` callback of an Observer. |

#### Returns

`Subscriber`\<`T`\>

A Subscriber wrapping the (partially defined)
Observer represented by the given arguments.

#### Deprecated

Do not use. Will be removed in v8. There is no replacement for this
method, and there is no reason to be creating instances of `Subscriber` directly.
If you have a specific use case, please file an issue.
