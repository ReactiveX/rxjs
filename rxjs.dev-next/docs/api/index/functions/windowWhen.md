[API](../../index.md) / [index](../index.md) / windowWhen

# Function: windowWhen()

```ts
function windowWhen<>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, Observable<T>>;
```

Defined in: [internal/operators/windowWhen.ts:54](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/windowWhen.ts#L54)

Branch out the source Observable values as a nested Observable using a
factory function of closing Observables to determine when to start a new
window.

<span class="informal">It's like [bufferWhen](bufferWhen.md), but emits a nested
Observable instead of an array.</span>

![](windowWhen.png)

Returns an Observable that emits windows of items it collects from the source
Observable. The output Observable emits connected, non-overlapping windows.
It emits the current window and opens a new one whenever the Observable
produced by the specified `closingSelector` function emits an item. The first
window is opened immediately when subscribing to the output Observable.

## Example

Emit only the first two clicks events in every window of [1-5] random seconds

```ts
import { fromEvent, windowWhen, interval, map, take, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  windowWhen(() => interval(1000 + Math.random() * 4000)),
  map(win => win.pipe(take(2))), // take at most 2 emissions from each window
  mergeAll()                     // flatten the Observable-of-Observables
);
result.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `closingSelector` | () => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that takes no arguments and returns an [ObservableInput](../type-aliases/ObservableInput.md) (that gets converted to Observable) that signals (on either `next` or `complete`) when to close the previous window and start a new one. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Observable`](../classes/Observable.md)\<`T`\>\>

A function that returns an Observable of windows, which in turn are
Observables.

## See

 - [window](window.md)
 - [windowCount](windowCount.md)
 - [windowTime](windowTime.md)
 - [windowToggle](windowToggle.md)
 - [bufferWhen](bufferWhen.md)
