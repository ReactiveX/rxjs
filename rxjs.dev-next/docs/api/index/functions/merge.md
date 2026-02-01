[API](../../index.md) / [index](../index.md) / merge

# Function: merge()

> Creates an output Observable which concurrently emits all values from every
> given input Observable.

## Description

<span class="informal">Flattens multiple Observables together by blending
their values into one Observable.</span>

![](merge.png)

`merge` subscribes to each given input Observable (as arguments), and simply
forwards (without doing any transformation) all the values from all the input
Observables to the output Observable. The output Observable only completes
once all input Observables have completed. Any error delivered by an input
Observable will be immediately emitted on the output Observable.

## Examples

Merge together two Observables: 1s interval and clicks

```ts
import { merge, fromEvent, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const timer = interval(1000);
const clicksOrTimer = merge(clicks, timer);
clicksOrTimer.subscribe(x => console.log(x));

// Results in the following:
// timer will emit ascending values, one every second(1000ms) to console
// clicks logs MouseEvents to console every time the "document" is clicked
// Since the two streams are merged you see these happening
// as they occur.
```

Merge together 3 Observables, but run only 2 concurrently

```ts
import { interval, take, merge } from 'rxjs';

const timer1 = interval(1000).pipe(take(10));
const timer2 = interval(2000).pipe(take(6));
const timer3 = interval(500).pipe(take(10));

const concurrent = 2; // the argument
const merged = merge(timer1, timer2, timer3, concurrent);
merged.subscribe(x => console.log(x));

// Results in the following:
// - First timer1 and timer2 will run concurrently
// - timer1 will emit a value every 1000ms for 10 iterations
// - timer2 will emit a value every 2000ms for 6 iterations
// - after timer1 hits its max iteration, timer2 will
//   continue, and timer3 will start to run concurrently with timer2
// - when timer2 hits its max iteration it terminates, and
//   timer3 will continue to emit a value every 500ms until it is complete
```

## See

 - [mergeAll](mergeAll.md)
 - [mergeMap](mergeMap.md)
 - [mergeMapTo](mergeMapTo.md)
 - [mergeScan](mergeScan.md)


is of type number, `merge` will use it to limit number of concurrently
subscribed `ObservableInput`s. If the last parameter is [SchedulerLike](../interfaces/SchedulerLike.md),
it will be used for scheduling the emission of values.

## Parameters

### `args`

`ObservableInput`s to merge together. If the last parameter


## Returns

`An`

Observable that emits items that are the result of every input Observable.


## Call Signature

```ts
function merge<>(...sources: [...ObservableInputTuple<A>[]]): Observable<A[number]>;
```

Defined in: [internal/observable/merge.ts:9](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/merge.ts#L9)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\[`number`\]\>

## Call Signature

```ts
function merge<>(...sourcesAndConcurrency: [...ObservableInputTuple<A>[], number?]): Observable<A[number]>;
```

Defined in: [internal/observable/merge.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/merge.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndConcurrency` | \[`...ObservableInputTuple<A>[]`, `number`?\] |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\[`number`\]\>

## Call Signature

```ts
function merge<>(...sourcesAndScheduler: [...ObservableInputTuple<A>[], SchedulerLike?]): Observable<A[number]>;
```

Defined in: [internal/observable/merge.ts:12](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/merge.ts#L12)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndScheduler` | \[`...ObservableInputTuple<A>[]`, [`SchedulerLike`](../interfaces/SchedulerLike.md)?\] |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\[`number`\]\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `scheduled` and `mergeAll`. Details: https://rxjs.dev/deprecations/scheduler-argument

## Call Signature

```ts
function merge<>(...sourcesAndConcurrencyAndScheduler: [...ObservableInputTuple<A>[], number?, SchedulerLike?]): Observable<A[number]>;
```

Defined in: [internal/observable/merge.ts:16](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/merge.ts#L16)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndConcurrencyAndScheduler` | \[`...ObservableInputTuple<A>[]`, `number`?, [`SchedulerLike`](../interfaces/SchedulerLike.md)?\] |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\[`number`\]\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `scheduled` and `mergeAll`. Details: https://rxjs.dev/deprecations/scheduler-argument
