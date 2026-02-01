[API](../../index.md) / [index](../index.md) / windowCount

# Function: windowCount()

```ts
function windowCount<>(windowSize: number, startWindowEvery: number): OperatorFunction<T, Observable<T>>;
```

Defined in: [internal/operators/windowCount.ts:68](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/windowCount.ts#L68)

Branch out the source Observable values as a nested Observable with each
nested Observable emitting at most `windowSize` values.

<span class="informal">It's like [bufferCount](bufferCount.md), but emits a nested
Observable instead of an array.</span>

![](windowCount.png)

Returns an Observable that emits windows of items it collects from the source
Observable. The output Observable emits windows every `startWindowEvery`
items, each containing no more than `windowSize` items. When the source
Observable completes or encounters an error, the output Observable emits
the current window and propagates the notification from the source
Observable. If `startWindowEvery` is not provided, then new windows are
started immediately at the start of the source and when each window completes
with size `windowSize`.

## Examples

Ignore every 3rd click event, starting from the first one

```ts
import { fromEvent, windowCount, map, skip, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  windowCount(3),
  map(win => win.pipe(skip(1))), // skip first of every 3 clicks
  mergeAll()                     // flatten the Observable-of-Observables
);
result.subscribe(x => console.log(x));
```

Ignore every 3rd click event, starting from the third one

```ts
import { fromEvent, windowCount, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  windowCount(2, 3),
  mergeAll() // flatten the Observable-of-Observables
);
result.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `windowSize` | `number` | `undefined` | The maximum number of values emitted by each window. |
| `startWindowEvery` | `number` | `0` | Interval at which to start a new window. For example if `startWindowEvery` is `2`, then a new window will be started on every other value from the source. A new window is started at the beginning of the source by default. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Observable`](../classes/Observable.md)\<`T`\>\>

A function that returns an Observable of windows, which in turn are
Observable of values.

## See

 - [window](window.md)
 - [windowTime](windowTime.md)
 - [windowToggle](windowToggle.md)
 - [windowWhen](windowWhen.md)
 - [bufferCount](bufferCount.md)
