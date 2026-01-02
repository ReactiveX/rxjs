[API](../../index.md) / [rxjs](../index.md) / mergeAll

# Function: mergeAll()

```ts
function mergeAll<>(concurrent: number): OperatorFunction<O, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/mergeAll.ts:64](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/mergeAll.ts#L64)

Converts a higher-order Observable into a first-order Observable which
concurrently delivers all values that are emitted on the inner Observables.

<span class="informal">Flattens an Observable-of-Observables.</span>

![](/images/marble-diagrams/mergeAll.png)

`mergeAll` subscribes to an Observable that emits Observables, also known as
a higher-order Observable. Each time it observes one of these emitted inner
Observables, it subscribes to that and delivers all the values from the
inner Observable on the output Observable. The output Observable only
completes once all inner Observables have completed. Any error delivered by
a inner Observable will be immediately emitted on the output Observable.

## Parameters

| Parameter    | Type     | Default value | Description                                                           |
| ------------ | -------- | ------------- | --------------------------------------------------------------------- |
| `concurrent` | `number` | `Infinity`    | Maximum number of inner Observables being subscribed to concurrently. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`O`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable that emits values coming from
all the inner Observables emitted by the source Observable.

## Example

Spawn a new interval Observable for each click event, and blend their outputs as one Observable

```ts
import { fromEvent, map, interval, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const higherOrder = clicks.pipe(map(() => interval(1000)));
const firstOrder = higherOrder.pipe(mergeAll());

firstOrder.subscribe((x) => console.log(x));
```

Count from 0 to 9 every second for each click, but only allow 2 concurrent timers

```ts
import { fromEvent, map, interval, take, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const higherOrder = clicks.pipe(map(() => interval(1000).pipe(take(10))));
const firstOrder = higherOrder.pipe(mergeAll(2));

firstOrder.subscribe((x) => console.log(x));
```

## See

- [combineLatestAll](combineLatestAll.md)
- [concatAll](concatAll.md)
- [exhaustAll](exhaustAll.md)
- [merge](merge.md)
- [mergeMap](mergeMap.md)
- [mergeMapTo](mergeMapTo.md)
- [mergeScan](mergeScan.md)
- [switchAll](switchAll.md)
- [switchMap](switchMap.md)
- [zipAll](zipAll.md)
