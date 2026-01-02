[API](../../index.md) / [rxjs](../index.md) / Subscription

# Class: Subscription

> Represents a disposable resource, such as the execution of an Observable. A
> Subscription has one important method, `unsubscribe`, that takes no argument
> and just disposes the resource held by the subscription.

## Description

Additionally, subscriptions may be grouped together through the `add()`
method, which will attach a child Subscription to the current Subscription.
When a Subscription is unsubscribed, all its children (and its grandchildren)
will be unsubscribed as well.

Defined in: [observable/src/observable.ts:49](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L49)

## Extended by

- [`SchedulerAction`](../interfaces/SchedulerAction.md)
- [`Subscriber`](Subscriber.md)

## Implements

- `SubscriptionLike`

## Constructors

### Constructor

```ts
new Subscription(initialTeardown?: () => void): Subscription;
```

Defined in: [observable/src/observable.ts:71](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L71)

#### Parameters

| Parameter          | Type         | Description                                                                                                                  |
| ------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `initialTeardown?` | () => `void` | A function executed first as part of the finalization process that is kicked off when [unsubscribe](#unsubscribe) is called. |

#### Returns

`Subscription`

## Properties

| Property                     | Type           | Default value | Description                                                                 |
| ---------------------------- | -------------- | ------------- | --------------------------------------------------------------------------- |
| <a id="closed"></a> `closed` | `boolean`      | `false`       | A flag to indicate whether this Subscription has already been unsubscribed. |
| <a id="empty"></a> `EMPTY`   | `Subscription` | `undefined`   | -                                                                           |

## Methods

### \[dispose\]()

```ts
dispose: void;
```

Defined in: [observable/src/observable.ts:185](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L185)

#### Returns

`void`

### add()

```ts
add(teardown: TeardownLogic): void;
```

Defined in: [observable/src/observable.ts:134](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L134)

Adds a finalizer to this subscription, so that finalization will be unsubscribed/called
when this subscription is unsubscribed. If this subscription is already [closed](#closed),
because it has already been unsubscribed, then whatever finalizer is passed to it
will automatically be executed (unless the finalizer itself is also a closed subscription).

Closed Subscriptions cannot be added as finalizers to any subscription. Adding a closed
subscription to a any subscription will result in no operation. (A noop).

Adding a subscription to itself, or adding `null` or `undefined` will not perform any
operation at all. (A noop).

`Subscription` instances that are added to this instance will automatically remove themselves
if they are unsubscribed. Functions and [Unsubscribable](../interfaces/Unsubscribable.md) objects that you wish to remove
will need to be removed manually with [remove](#remove)

#### Parameters

| Parameter  | Type            | Description                                         |
| ---------- | --------------- | --------------------------------------------------- |
| `teardown` | `TeardownLogic` | The finalization logic to add to this subscription. |

#### Returns

`void`

### remove()

```ts
remove(teardown: Unsubscribable | Subscription | () => void): void;
```

Defined in: [observable/src/observable.ts:176](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L176)

Removes a finalizer from this subscription that was previously added with the [add](#add) method.

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

| Parameter  | Type                                               | Description                                    |
| ---------- | -------------------------------------------------- | ---------------------------------------------- |
| `teardown` | `Unsubscribable` \| `Subscription` \| () => `void` | The finalizer to remove from this subscription |

#### Returns

`void`

### unsubscribe()

```ts
unsubscribe(): void;
```

Defined in: [observable/src/observable.ts:78](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L78)

Disposes the resources held by the subscription. May, for instance, cancel
an ongoing Observable execution or cancel any other type of work that
started when the Subscription was created.

#### Returns

`void`

#### Implementation of

```ts
SubscriptionLike.unsubscribe;
```
