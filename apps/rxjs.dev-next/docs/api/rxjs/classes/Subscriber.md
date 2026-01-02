[API](../../index.md) / [rxjs](../index.md) / Subscriber

# Class: Subscriber

## Description

Implements the [Observer](../interfaces/Observer.md) interface and extends the
[Subscription](Subscription.md) class. While the [Observer](../interfaces/Observer.md) is the public API for
consuming the values of an [Observable](Observable.md), all Observers get converted to
a Subscriber, in order to provide Subscription-like capabilities such as
`unsubscribe`. Subscriber is a common type in RxJS, and crucial for
implementing operators, but it is rarely used as a public API.

Defined in: [observable/src/observable.ts:239](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L239)

Implements the [Observer](../interfaces/Observer.md) interface and extends the
[Subscription](Subscription.md) class. While the [Observer](../interfaces/Observer.md) is the public API for
consuming the values of an [Observable](Observable.md), all Observers get converted to
a Subscriber, in order to provide Subscription-like capabilities such as
`unsubscribe`. Subscriber is a common type in RxJS, and crucial for
implementing operators, but it is rarely used as a public API.

## Extends

- [`Subscription`](Subscription.md)

## Implements

- `Observer`\<`T`\>

## Constructors

### Constructor

```ts
new Subscriber<>(destination?:
  | Subscriber<T>
  | Partial<Observer<T>>
  | (value: T) => void
| null): Subscriber<T>;
```

Defined in: [observable/src/observable.ts:257](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L257)

#### Parameters

| Parameter      | Type                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `destination?` | \| `Subscriber`\<`T`\> \| `Partial`\<`Observer`\<`T`\>\> \| (`value`: `T`) => `void` \| `null` |

#### Returns

`Subscriber`\<`T`\>

#### Deprecated

Do not create instances of `Subscriber` directly. Use [operate](../functions/operate.md) instead.

#### Overrides

[`Subscription`](Subscription.md).[`constructor`](Subscription.md#constructor)

## Properties

| Property                     | Type                              | Default value | Description                                                                 | Inherited from                                                       |
| ---------------------------- | --------------------------------- | ------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <a id="closed"></a> `closed` | `boolean`                         | `false`       | A flag to indicate whether this Subscription has already been unsubscribed. | [`Subscription`](Subscription.md).[`closed`](Subscription.md#closed) |
| <a id="empty"></a> `EMPTY`   | [`Subscription`](Subscription.md) | `undefined`   | -                                                                           | [`Subscription`](Subscription.md).[`EMPTY`](Subscription.md#empty)   |

## Methods

### \[dispose\]()

```ts
dispose: void;
```

Defined in: [observable/src/observable.ts:185](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L185)

#### Returns

`void`

#### Inherited from

[`Subscription`](Subscription.md).[`[dispose]`](Subscription.md#dispose)

### add()

```ts
add(teardown: TeardownLogic): void;
```

Defined in: [observable/src/observable.ts:134](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L134)

Adds a finalizer to this subscription, so that finalization will be unsubscribed/called
when this subscription is unsubscribed. If this subscription is already [closed](Subscription.md#closed),
because it has already been unsubscribed, then whatever finalizer is passed to it
will automatically be executed (unless the finalizer itself is also a closed subscription).

Closed Subscriptions cannot be added as finalizers to any subscription. Adding a closed
subscription to a any subscription will result in no operation. (A noop).

Adding a subscription to itself, or adding `null` or `undefined` will not perform any
operation at all. (A noop).

`Subscription` instances that are added to this instance will automatically remove themselves
if they are unsubscribed. Functions and [Unsubscribable](../interfaces/Unsubscribable.md) objects that you wish to remove
will need to be removed manually with [remove](Subscription.md#remove)

#### Parameters

| Parameter  | Type            | Description                                         |
| ---------- | --------------- | --------------------------------------------------- |
| `teardown` | `TeardownLogic` | The finalization logic to add to this subscription. |

#### Returns

`void`

#### Inherited from

[`Subscription`](Subscription.md).[`add`](Subscription.md#add)

### complete()

```ts
complete(): void;
```

Defined in: [observable/src/observable.ts:345](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L345)

The [Observer](../interfaces/Observer.md) callback to receive a valueless notification of type
`complete` from the Observable. Notifies the Observer that the Observable
has finished sending push-based notifications.

#### Returns

`void`

#### Implementation of

```ts
Observer.complete;
```

### error()

```ts
error(err?: any): void;
```

Defined in: [observable/src/observable.ts:331](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L331)

The [Observer](../interfaces/Observer.md) callback to receive notifications of type `error` from
the Observable, with an attached `Error`. Notifies the Observer that
the Observable has experienced an error condition.

#### Parameters

| Parameter | Type  | Description            |
| --------- | ----- | ---------------------- |
| `err?`    | `any` | The `error` exception. |

#### Returns

`void`

#### Implementation of

```ts
Observer.error;
```

### next()

```ts
next(value: T): void;
```

Defined in: [observable/src/observable.ts:317](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L317)

The [Observer](../interfaces/Observer.md) callback to receive notifications of type `next` from
the Observable, with a value. The Observable may call this method 0 or more
times.

#### Parameters

| Parameter | Type | Description       |
| --------- | ---- | ----------------- |
| `value`   | `T`  | The `next` value. |

#### Returns

`void`

#### Implementation of

```ts
Observer.next;
```

### remove()

```ts
remove(teardown: Unsubscribable | Subscription | () => void): void;
```

Defined in: [observable/src/observable.ts:176](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L176)

Removes a finalizer from this subscription that was previously added with the [add](Subscription.md#add) method.

Note that `Subscription` instances, when unsubscribed, will automatically remove themselves
from every other `Subscription` they have been added to. This means that using the `remove` method
is not a common thing and should be used thoughtfully.

If you add the same finalizer instance of a function or an unsubscribable object to a `Subscription` instance
more than once, you will need to call `remove` the same number of times to remove all instances.

All finalizer instances are removed to free up memory upon unsubscription.

TIP: In instances you're adding and removing _Subscriptions from other Subscriptions_, you should
be sure to unsubscribe or otherwise get rid of the child subscription reference as soon as you remove it.
The child subscription has a reference to the parent it was added to via closure. In most cases, this
a non-issue, as child subscriptions are rarely long-lived.

#### Parameters

| Parameter  | Type                                                                  | Description                                    |
| ---------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| `teardown` | `Unsubscribable` \| [`Subscription`](Subscription.md) \| () => `void` | The finalizer to remove from this subscription |

#### Returns

`void`

#### Inherited from

[`Subscription`](Subscription.md).[`remove`](Subscription.md#remove)

### unsubscribe()

```ts
unsubscribe(): void;
```

Defined in: [observable/src/observable.ts:354](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L354)

Disposes the resources held by the subscription. May, for instance, cancel
an ongoing Observable execution or cancel any other type of work that
started when the Subscription was created.

#### Returns

`void`

#### Overrides

[`Subscription`](Subscription.md).[`unsubscribe`](Subscription.md#unsubscribe)
