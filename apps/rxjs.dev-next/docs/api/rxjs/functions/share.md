[API](../../index.md) / [rxjs](../index.md) / share

# Function: share()

> Returns a new Observable that multicasts (shares) the original Observable.

## Description

As long as there is at least one
Subscriber this Observable will be subscribed and emitting data. When all subscribers have unsubscribed it will
unsubscribe from the source Observable. Because the Observable is multicasting it makes the stream `hot`.

The subscription to the underlying source Observable can be reset (unsubscribe and resubscribe for new subscribers),
if the subscriber count to the shared observable drops to 0, or if the source Observable errors or completes. It is
possible to use notifier factories for the resets to allow for behaviors like conditional or delayed resets. Please
note that resetting on error or complete of the source Observable does not behave like a transparent retry or restart
of the source because the error or complete will be forwarded to all subscribers and their subscription will be
closed. Only new subscribers after a reset on error or complete happened will cause a fresh subscription to the
source. To achieve transparent retries or restarts pipe the source through appropriate operators before sharing.

![](/images/marble-diagrams/share.png)

```ts
function share<>(options: ShareConfig<T>): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/share.ts:48](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/share.ts#L48)

Returns a new Observable that multicasts (shares) the original Observable. As long as there is at least one
Subscriber this Observable will be subscribed and emitting data. When all subscribers have unsubscribed it will
unsubscribe from the source Observable. Because the Observable is multicasting it makes the stream `hot`.

The subscription to the underlying source Observable can be reset (unsubscribe and resubscribe for new subscribers),
if the subscriber count to the shared observable drops to 0, or if the source Observable errors or completes. It is
possible to use notifier factories for the resets to allow for behaviors like conditional or delayed resets. Please
note that resetting on error or complete of the source Observable does not behave like a transparent retry or restart
of the source because the error or complete will be forwarded to all subscribers and their subscription will be
closed. Only new subscribers after a reset on error or complete happened will cause a fresh subscription to the
source. To achieve transparent retries or restarts pipe the source through appropriate operators before sharing.

![](/images/marble-diagrams/share.png)

## Parameters

| Parameter | Type                                                 |
| --------- | ---------------------------------------------------- |
| `options` | [`ShareConfig`](../interfaces/ShareConfig.md)\<`T`\> |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

## Examples

Generate new multicast Observable from the `source` Observable value

```ts
import { interval, tap, map, take, share } from 'rxjs';

const source = interval(1000).pipe(
  tap((x) => console.log('Processing: ', x)),
  map((x) => x * x),
  take(6),
  share()
);

source.subscribe((x) => console.log('subscription 1: ', x));
source.subscribe((x) => console.log('subscription 2: ', x));

// Logs:
// Processing: 0
// subscription 1: 0
// subscription 2: 0
// Processing: 1
// subscription 1: 1
// subscription 2: 1
// Processing: 2
// subscription 1: 4
// subscription 2: 4
// Processing: 3
// subscription 1: 9
// subscription 2: 9
// Processing: 4
// subscription 1: 16
// subscription 2: 16
// Processing: 5
// subscription 1: 25
// subscription 2: 25
```

```ts
import { interval, take, share, timer } from 'rxjs';

const source = interval(1000).pipe(
  take(3),
  share({
    resetOnRefCountZero: () => timer(1000),
  })
);

const subscriptionOne = source.subscribe((x) => console.log('subscription 1: ', x));
setTimeout(() => subscriptionOne.unsubscribe(), 1300);

setTimeout(() => source.subscribe((x) => console.log('subscription 2: ', x)), 1700);

setTimeout(() => source.subscribe((x) => console.log('subscription 3: ', x)), 5000);

// Logs:
// subscription 1:  0
// (subscription 1 unsubscribes here)
// (subscription 2 subscribes here ~400ms later, source was not reset)
// subscription 2:  1
// subscription 2:  2
// (subscription 2 unsubscribes here)
// (subscription 3 subscribes here ~2000ms later, source did reset before)
// subscription 3:  0
// subscription 3:  1
// subscription 3:  2
```

## See

[shareReplay](shareReplay.md)
