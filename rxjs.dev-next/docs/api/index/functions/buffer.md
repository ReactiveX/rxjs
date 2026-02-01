[API](../../index.md) / [index](../index.md) / buffer

# Function: buffer()

```ts
function buffer<>(closingNotifier: ObservableInput<any>): OperatorFunction<T, T[]>;
```

Defined in: [internal/operators/buffer.ts:45](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/buffer.ts#L45)

Buffers the source Observable values until `closingNotifier` emits.

<span class="informal">Collects values from the past as an array, and emits
that array only when another Observable emits.</span>

![](buffer.png)

Buffers the incoming Observable values until the given `closingNotifier`
`ObservableInput` (that internally gets converted to an Observable)
emits a value, at which point it emits the buffer on the output
Observable and starts a new buffer internally, awaiting the next time
`closingNotifier` emits.

## Example

On every click, emit array of most recent interval events

```ts
import { fromEvent, interval, buffer } from 'rxjs';

const clicks = fromEvent(document, 'click');
const intervalEvents = interval(1000);
const buffered = intervalEvents.pipe(buffer(clicks));
buffered.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `closingNotifier` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | An `ObservableInput` that signals the buffer to be emitted on the output Observable. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`[]\>

A function that returns an Observable of buffers, which are arrays
of values.

## See

 - [bufferCount](bufferCount.md)
 - [bufferTime](bufferTime.md)
 - [bufferToggle](bufferToggle.md)
 - [bufferWhen](bufferWhen.md)
 - [window](window.md)
