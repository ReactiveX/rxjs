[API](../../index.md) / [index](../index.md) / bufferCount

# Function: bufferCount()

```ts
function bufferCount<>(bufferSize: number, startBufferEvery: number | null): OperatorFunction<T, T[]>;
```

Defined in: [internal/operators/bufferCount.ts:57](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/bufferCount.ts#L57)

Buffers the source Observable values until the size hits the maximum
`bufferSize` given.

<span class="informal">Collects values from the past as an array, and emits
that array only when its size reaches `bufferSize`.</span>

![](bufferCount.png)

Buffers a number of values from the source Observable by `bufferSize` then
emits the buffer and clears it, and starts a new buffer each
`startBufferEvery` values. If `startBufferEvery` is not provided or is
`null`, then new buffers are started immediately at the start of the source
and when each buffer closes and is emitted.

## Examples

Emit the last two click events as an array

```ts
import { fromEvent, bufferCount } from 'rxjs';

const clicks = fromEvent(document, 'click');
const buffered = clicks.pipe(bufferCount(2));
buffered.subscribe(x => console.log(x));
```

On every click, emit the last two click events as an array

```ts
import { fromEvent, bufferCount } from 'rxjs';

const clicks = fromEvent(document, 'click');
const buffered = clicks.pipe(bufferCount(2, 1));
buffered.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `bufferSize` | `number` | `undefined` | The maximum size of the buffer emitted. |
| `startBufferEvery` | `number` \| `null` | `null` | Interval at which to start a new buffer. For example if `startBufferEvery` is `2`, then a new buffer will be started on every other value from the source. A new buffer is started at the beginning of the source by default. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`[]\>

A function that returns an Observable of arrays of buffered values.

## See

 - [buffer](buffer.md)
 - [bufferTime](bufferTime.md)
 - [bufferToggle](bufferToggle.md)
 - [bufferWhen](bufferWhen.md)
 - [pairwise](pairwise.md)
 - [windowCount](windowCount.md)
