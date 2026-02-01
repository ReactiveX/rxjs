[API](../../index.md) / [index](../index.md) / VirtualAction

# Class: VirtualAction

Defined in: [internal/scheduler/VirtualTimeScheduler.ts:63](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/scheduler/VirtualTimeScheduler.ts#L63)

## Extends

- `AsyncAction`\<`T`\>

## Constructors

### Constructor

```ts
new VirtualAction<>(
   scheduler: VirtualTimeScheduler, 
   work: (this: SchedulerAction<T>, state?: T) => void, 
index: number): VirtualAction<T>;
```

Defined in: [internal/scheduler/VirtualTimeScheduler.ts:66](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/scheduler/VirtualTimeScheduler.ts#L66)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `scheduler` | [`VirtualTimeScheduler`](VirtualTimeScheduler.md) |
| `work` | (`this`: [`SchedulerAction`](../interfaces/SchedulerAction.md)\<`T`\>, `state?`: `T`) => `void` |
| `index` | `number` |

#### Returns

`VirtualAction`\<`T`\>

#### Overrides

```ts
AsyncAction<T>.constructor
```

## Properties

| Property | Type | Default value | Description | Inherited from |
| ------ | ------ | ------ | ------ | ------ |
| <a id="closed"></a> `closed` | `boolean` | `false` | A flag to indicate whether this Subscription has already been unsubscribed. | `AsyncAction.closed` |
| <a id="delay"></a> `delay` | `number` | `undefined` | - | `AsyncAction.delay` |
| <a id="id"></a> `id` | `number` \| `undefined` | `undefined` | - | `AsyncAction.id` |
| <a id="state"></a> `state?` | `T` | `undefined` | - | `AsyncAction.state` |
| <a id="empty"></a> `EMPTY` | [`Subscription`](Subscription.md) | `undefined` | - | `AsyncAction.EMPTY` |

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

```ts
AsyncAction.add
```

### execute()

```ts
execute(state: T, delay: number): any;
```

Defined in: [internal/scheduler/AsyncAction.ts:88](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/scheduler/AsyncAction.ts#L88)

Immediately executes this action and the `work` it contains.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `state` | `T` |
| `delay` | `number` |

#### Returns

`any`

#### Inherited from

```ts
AsyncAction.execute
```

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

```ts
AsyncAction.remove
```

### schedule()

```ts
schedule(state?: T, delay?: number): Subscription;
```

Defined in: [internal/scheduler/VirtualTimeScheduler.ts:75](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/scheduler/VirtualTimeScheduler.ts#L75)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `state?` | `T` | `undefined` |
| `delay?` | `number` | `0` |

#### Returns

[`Subscription`](Subscription.md)

#### Overrides

```ts
AsyncAction.schedule
```

### unsubscribe()

```ts
unsubscribe(): void;
```

Defined in: [internal/scheduler/AsyncAction.ts:133](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/scheduler/AsyncAction.ts#L133)

Disposes the resources held by the subscription. May, for instance, cancel
an ongoing Observable execution or cancel any other type of work that
started when the Subscription was created.

#### Returns

`void`

#### Inherited from

```ts
AsyncAction.unsubscribe
```
