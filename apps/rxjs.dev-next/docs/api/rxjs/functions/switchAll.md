[API](../../index.md) / [rxjs](../index.md) / switchAll

# Function: switchAll()

```ts
function switchAll<>(): OperatorFunction<O, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/switchAll.ts:63](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/switchAll.ts#L63)

Converts a higher-order Observable into a first-order Observable
producing values only from the most recent observable sequence

<span class="informal">Flattens an Observable-of-Observables.</span>

![](/images/marble-diagrams/switchAll.png)

`switchAll` subscribes to a source that is an observable of observables, also known as a
"higher-order observable" (or `Observable<Observable<T>>`). It subscribes to the most recently
provided "inner observable" emitted by the source, unsubscribing from any previously subscribed
to inner observable, such that only the most recent inner observable may be subscribed to at
any point in time. The resulting observable returned by `switchAll` will only complete if the
source observable completes, _and_ any currently subscribed to inner observable also has completed,
if there are any.

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`O`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable that converts a higher-order
Observable into a first-order Observable producing values only from the most
recent Observable sequence.

## Example

Spawn a new interval observable for each click event, but for every new
click, cancel the previous interval and subscribe to the new one

```ts
import { fromEvent, tap, map, interval, switchAll } from 'rxjs';

const clicks = fromEvent(document, 'click').pipe(tap(() => console.log('click')));
const source = clicks.pipe(map(() => interval(1000)));

source.pipe(switchAll()).subscribe((x) => console.log(x));

// Output
// click
// 0
// 1
// 2
// 3
// ...
// click
// 0
// 1
// 2
// ...
// click
// ...
```

## See

- [combineLatestAll](combineLatestAll.md)
- [concatAll](concatAll.md)
- [exhaustAll](exhaustAll.md)
- [switchMap](switchMap.md)
- [switchMapTo](switchMapTo.md)
- [mergeAll](mergeAll.md)
