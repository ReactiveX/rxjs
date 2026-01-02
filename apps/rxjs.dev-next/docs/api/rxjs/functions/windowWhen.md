[API](../../index.md) / [rxjs](../index.md) / windowWhen

# Function: windowWhen()

```ts
function windowWhen<>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, Observable<T>>;
```

Defined in: [rxjs/src/internal/operators/windowWhen.ts:54](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/windowWhen.ts#L54)

Branch out the source Observable values as a nested Observable using a
factory function of closing Observables to determine when to start a new
window.

<span class="informal">It's like [bufferWhen](bufferWhen.md), but emits a nested
Observable instead of an array.</span>

<div><img class="only-light" src="/images/marble-diagrams/windowWhen-light.svg" alt="Marble diagram" />
<img class="only-dark" src="/images/marble-diagrams/windowWhen-dark.svg" alt="Marble diagram" /></div>

Returns an Observable that emits Observable windows of items it collects from
the source Observable. The output Observable emits connected, non-overlapping
windows. It emits the current window immediately when subscribing to the source
Observable and opens a new one whenever the Observable produced by the specified
`closingSelector` function emits `next`. When an Observable returned by the
`closingSelector` emits `next`, the previous window completes and a new window
is emitted to the output subscriber.

## Parameters

| Parameter         | Type                                                                   | Description                                                                                                                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `closingSelector` | () => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that takes no arguments and returns an [ObservableInput](../type-aliases/ObservableInput.md) (that gets converted to Observable) that signals when to close the previous window and start a new one. Note that a value (any value) must be observed to signal window closure. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Observable`](../classes/Observable.md)\<`T`\>\>

A function that returns an Observable of windows, which in turn are
Observables.

## Example

Emit only the first two clicks events in every window of [1-5] random seconds

```ts
import { fromEvent, windowWhen, interval, map, take, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  windowWhen(() => interval(1000 + Math.random() * 4000)),
  map((win) => win.pipe(take(2))), // take at most 2 emissions from each window
  mergeAll() // flatten the Observable-of-Observables
);
result.subscribe((x) => console.log(x));
```

## See

- [window](window.md)
- [windowCount](windowCount.md)
- [windowTime](windowTime.md)
- [windowToggle](windowToggle.md)
- [bufferWhen](bufferWhen.md)
