[API](../../index.md) / [index](../index.md) / bufferToggle

# Function: bufferToggle()

```ts
function bufferToggle<>(openings: ObservableInput<O>, closingSelector: (value: O) => ObservableInput<any>): OperatorFunction<T, T[]>;
```

Defined in: [internal/operators/bufferToggle.ts:52](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/bufferToggle.ts#L52)

Buffers the source Observable values starting from an emission from
`openings` and ending when the output of `closingSelector` emits.

<span class="informal">Collects values from the past as an array. Starts
collecting only when `opening` emits, and calls the `closingSelector`
function to get an Observable that tells when to close the buffer.</span>

![](bufferToggle.png)

Buffers values from the source by opening the buffer via signals from an
Observable provided to `openings`, and closing and sending the buffers when
a Subscribable or Promise returned by the `closingSelector` function emits.

## Example

Every other second, emit the click events from the next 500ms

```ts
import { fromEvent, interval, bufferToggle, EMPTY } from 'rxjs';

const clicks = fromEvent(document, 'click');
const openings = interval(1000);
const buffered = clicks.pipe(bufferToggle(openings, i =>
  i % 2 ? interval(500) : EMPTY
));
buffered.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `openings` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`O`\> | A Subscribable or Promise of notifications to start new buffers. |
| `closingSelector` | (`value`: `O`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that takes the value emitted by the `openings` observable and returns a Subscribable or Promise, which, when it emits, signals that the associated buffer should be emitted and cleared. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`[]\>

A function that returns an Observable of arrays of buffered values.

## See

 - [buffer](buffer.md)
 - [bufferCount](bufferCount.md)
 - [bufferTime](bufferTime.md)
 - [bufferWhen](bufferWhen.md)
 - [windowToggle](windowToggle.md)
