[API](../../index.md) / [rxjs](../index.md) / subscribeOn

# Function: subscribeOn()

```ts
function subscribeOn<>(scheduler: SchedulerLike, delay: number): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/subscribeOn.ts:63](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/subscribeOn.ts#L63)

Asynchronously subscribes Observers to this Observable on the specified [SchedulerLike](../interfaces/SchedulerLike.md).

With `subscribeOn` you can decide what type of scheduler a specific Observable will be using when it is subscribed to.

Schedulers control the speed and order of emissions to observers from an Observable stream.

![](/images/marble-diagrams/subscribeOn.png)

## Parameters

| Parameter   | Type                                              | Default value | Description                                                                             |
| ----------- | ------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | `undefined`   | The [SchedulerLike](../interfaces/SchedulerLike.md) to perform subscription actions on. |
| `delay`     | `number`                                          | `0`           | A delay to pass to the scheduler to delay subscriptions                                 |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable modified so that its
subscriptions happen on the specified [SchedulerLike](../interfaces/SchedulerLike.md).

## Example

Given the following code:

```ts
import { of, merge } from 'rxjs';

const a = of(1, 2, 3);
const b = of(4, 5, 6);

merge(a, b).subscribe(console.log);

// Outputs
// 1
// 2
// 3
// 4
// 5
// 6
```

Both Observable `a` and `b` will emit their values directly and synchronously once they are subscribed to.

If we instead use the `subscribeOn` operator declaring that we want to use the [asyncScheduler](../variables/asyncScheduler.md) for values emitted by Observable `a`:

```ts
import { of, subscribeOn, asyncScheduler, merge } from 'rxjs';

const a = of(1, 2, 3).pipe(subscribeOn(asyncScheduler));
const b = of(4, 5, 6);

merge(a, b).subscribe(console.log);

// Outputs
// 4
// 5
// 6
// 1
// 2
// 3
```

The reason for this is that Observable `b` emits its values directly and synchronously like before
but the emissions from `a` are scheduled on the event loop because we are now using the [asyncScheduler](../variables/asyncScheduler.md) for that specific Observable.
