[API](../../index.md) / [index](../index.md) / windowTime

# Function: windowTime()

> Branch out the source Observable values as a nested Observable periodically
> in time.

## Description

<span class="informal">It's like [bufferTime](bufferTime.md), but emits a nested
Observable instead of an array.</span>

![](windowTime.png)

Returns an Observable that emits windows of items it collects from the source
Observable. The output Observable starts a new window periodically, as
determined by the `windowCreationInterval` argument. It emits each window
after a fixed timespan, specified by the `windowTimeSpan` argument. When the
source Observable completes or encounters an error, the output Observable
emits the current window and propagates the notification from the source
Observable. If `windowCreationInterval` is not provided, the output
Observable starts a new window when the previous window of duration
`windowTimeSpan` completes. If `maxWindowCount` is provided, each window
will emit at most fixed number of values. Window will complete immediately
after emitting last value and next one still will open as specified by
`windowTimeSpan` and `windowCreationInterval` arguments.

## Examples

In every window of 1 second each, emit at most 2 click events

```ts
import { fromEvent, windowTime, map, take, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  windowTime(1000),
  map(win => win.pipe(take(2))), // take at most 2 emissions from each window
  mergeAll()                     // flatten the Observable-of-Observables
);
result.subscribe(x => console.log(x));
```

Every 5 seconds start a window 1 second long, and emit at most 2 click events per window

```ts
import { fromEvent, windowTime, map, take, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  windowTime(1000, 5000),
  map(win => win.pipe(take(2))), // take at most 2 emissions from each window
  mergeAll()                     // flatten the Observable-of-Observables
);
result.subscribe(x => console.log(x));
```

Same as example above but with `maxWindowCount` instead of `take`

```ts
import { fromEvent, windowTime, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  windowTime(1000, 5000, 2), // take at most 2 emissions from each window
  mergeAll()                 // flatten the Observable-of-Observables
);
result.subscribe(x => console.log(x));
```

## See

 - [window](window.md)
 - [windowCount](windowCount.md)
 - [windowToggle](windowToggle.md)
 - [windowWhen](windowWhen.md)
 - [bufferTime](bufferTime.md)




windows.


values each window can emit before completion.


intervals that determine window boundaries.

## Parameters

### `windowTimeSpan`

The amount of time, in milliseconds, to fill each window.

### `windowCreationInterval`

The interval at which to start new

### `maxWindowSize`

Max number of

### `scheduler`

The scheduler on which to schedule the


## Returns

`A`

function that returns an Observable of windows, which in turn are Observables.


## Call Signature

```ts
function windowTime<>(windowTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
```

Defined in: [internal/operators/windowTime.ts:12](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/windowTime.ts#L12)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `windowTimeSpan` | `number` |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Observable`](../classes/Observable.md)\<`T`\>\>

## Call Signature

```ts
function windowTime<>(
   windowTimeSpan: number, 
   windowCreationInterval: number, 
scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
```

Defined in: [internal/operators/windowTime.ts:13](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/windowTime.ts#L13)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `windowTimeSpan` | `number` |
| `windowCreationInterval` | `number` |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Observable`](../classes/Observable.md)\<`T`\>\>

## Call Signature

```ts
function windowTime<>(
   windowTimeSpan: number, 
   windowCreationInterval: number | void | null, 
   maxWindowSize: number, 
scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
```

Defined in: [internal/operators/windowTime.ts:18](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/windowTime.ts#L18)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `windowTimeSpan` | `number` |
| `windowCreationInterval` | `number` \| `void` \| `null` |
| `maxWindowSize` | `number` |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Observable`](../classes/Observable.md)\<`T`\>\>
