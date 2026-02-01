[API](../../index.md) / [index](../index.md) / windowToggle

# Function: windowToggle()

```ts
function windowToggle<>(openings: ObservableInput<O>, closingSelector: (openValue: O) => ObservableInput<any>): OperatorFunction<T, Observable<T>>;
```

Defined in: [internal/operators/windowToggle.ts:56](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/windowToggle.ts#L56)

Branch out the source Observable values as a nested Observable starting from
an emission from `openings` and ending when the output of `closingSelector`
emits.

<span class="informal">It's like [bufferToggle](bufferToggle.md), but emits a nested
Observable instead of an array.</span>

![](windowToggle.png)

Returns an Observable that emits windows of items it collects from the source
Observable. The output Observable emits windows that contain those items
emitted by the source Observable between the time when the `openings`
Observable emits an item and when the Observable returned by
`closingSelector` emits an item.

## Example

Every other second, emit the click events from the next 500ms

```ts
import { fromEvent, interval, windowToggle, EMPTY, mergeAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const openings = interval(1000);
const result = clicks.pipe(
  windowToggle(openings, i => i % 2 ? interval(500) : EMPTY),
  mergeAll()
);
result.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `openings` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`O`\> | An observable of notifications to start new windows. |
| `closingSelector` | (`openValue`: `O`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that takes the value emitted by the `openings` observable and returns an Observable, which, when it emits a next notification, signals that the associated window should complete. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Observable`](../classes/Observable.md)\<`T`\>\>

A function that returns an Observable of windows, which in turn are
Observables.

## See

 - [window](window.md)
 - [windowCount](windowCount.md)
 - [windowTime](windowTime.md)
 - [windowWhen](windowWhen.md)
 - [bufferToggle](bufferToggle.md)
