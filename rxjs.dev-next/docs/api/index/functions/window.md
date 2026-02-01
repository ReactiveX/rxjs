[API](../../index.md) / [index](../index.md) / window

# Function: window()

```ts
function window<>(windowBoundaries: ObservableInput<any>): OperatorFunction<T, Observable<T>>;
```

Defined in: [internal/operators/window.ts:53](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/window.ts#L53)

Branch out the source Observable values as a nested Observable whenever
`windowBoundaries` emits.

<span class="informal">It's like [buffer](buffer.md), but emits a nested Observable
instead of an array.</span>

![](window.png)

Returns an Observable that emits windows of items it collects from the source
Observable. The output Observable emits connected, non-overlapping
windows. It emits the current window and opens a new one whenever the
`windowBoundaries` emits an item. `windowBoundaries` can be any type that
`ObservableInput` accepts. It internally gets converted to an Observable.
Because each window is an Observable, the output is a higher-order Observable.

## Example

In every window of 1 second each, emit at most 2 click events

```ts
import { fromEvent, interval, window, map, take, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const sec = interval(1000);
const result = clicks.pipe(
  window(sec),
  map(win => win.pipe(take(2))), // take at most 2 emissions from each window
  mergeAll()                     // flatten the Observable-of-Observables
);
result.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `windowBoundaries` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | An `ObservableInput` that completes the previous window and starts a new window. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Observable`](../classes/Observable.md)\<`T`\>\>

A function that returns an Observable of windows, which are
Observables emitting values of the source Observable.

## See

 - [windowCount](windowCount.md)
 - [windowTime](windowTime.md)
 - [windowToggle](windowToggle.md)
 - [windowWhen](windowWhen.md)
 - [buffer](buffer.md)
