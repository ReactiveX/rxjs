[API](../../index.md) / [index](../index.md) / bufferWhen

# Function: bufferWhen()

```ts
function bufferWhen<>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, T[]>;
```

Defined in: [internal/operators/bufferWhen.ts:46](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/bufferWhen.ts#L46)

Buffers the source Observable values, using a factory function of closing
Observables to determine when to close, emit, and reset the buffer.

<span class="informal">Collects values from the past as an array. When it
starts collecting values, it calls a function that returns an Observable that
tells when to close the buffer and restart collecting.</span>

![](bufferWhen.svg)

Opens a buffer immediately, then closes the buffer when the observable
returned by calling `closingSelector` function emits a value. When it closes
the buffer, it immediately opens a new buffer and repeats the process.

## Example

Emit an array of the last clicks every [1-5] random seconds

```ts
import { fromEvent, bufferWhen, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const buffered = clicks.pipe(
  bufferWhen(() => interval(1000 + Math.random() * 4000))
);
buffered.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `closingSelector` | () => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that takes no arguments and returns an Observable that signals buffer closure. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`[]\>

A function that returns an Observable of arrays of buffered values.

## See

 - [buffer](buffer.md)
 - [bufferCount](bufferCount.md)
 - [bufferTime](bufferTime.md)
 - [bufferToggle](bufferToggle.md)
 - [windowWhen](windowWhen.md)
