[API](../../index.md) / [rxjs](../index.md) / bufferTime

# Function: bufferTime()

> Buffers the source Observable values for a specific time period.

## Description

<span class="informal">Collects values from the past as an array, and emits
those arrays periodically in time.</span>

![](/images/marble-diagrams/bufferTime.png)

Buffers values from the source for a specific time duration `bufferTimeSpan`.
Unless the optional argument `bufferCreationInterval` is given, it emits and
resets the buffer every `bufferTimeSpan` milliseconds. If
`bufferCreationInterval` is given, this operator opens the buffer every
`bufferCreationInterval` milliseconds and closes (emits and resets) the
buffer every `bufferTimeSpan` milliseconds. When the optional argument
`maxBufferSize` is specified, the buffer will be closed either after
`bufferTimeSpan` milliseconds or when it contains `maxBufferSize` elements.

## Example

Every second, emit an array of the recent click events

```ts
import { fromEvent, bufferTime } from 'rxjs';

const clicks = fromEvent(document, 'click');
const buffered = clicks.pipe(bufferTime(1000));
buffered.subscribe((x) => console.log(x));
```

Every 5 seconds, emit the click events from the next 2 seconds

```ts
import { fromEvent, bufferTime } from 'rxjs';

const clicks = fromEvent(document, 'click');
const buffered = clicks.pipe(bufferTime(2000, 5000));
buffered.subscribe((x) => console.log(x));
```

## See

- [buffer](buffer.md)
- [bufferCount](bufferCount.md)
- [bufferToggle](bufferToggle.md)
- [bufferWhen](bufferWhen.md)
- [windowTime](windowTime.md)

- `bufferCreationInterval` - the interval at which to start new buffers;
- `maxBufferSize` - the maximum buffer size;
- `scheduler` - the scheduler on which to schedule the intervals that determine buffer boundaries.

## Parameters

### `bufferTimeSpan`

The amount of time to fill each buffer array.

### `otherArgs`

Other configuration arguments such as:

## Returns

`A`

function that returns an Observable of arrays of buffered values.

## Call Signature

```ts
function bufferTime<>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
```

Defined in: [rxjs/src/internal/operators/bufferTime.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/bufferTime.ts#L8)

### Parameters

| Parameter        | Type                                              |
| ---------------- | ------------------------------------------------- |
| `bufferTimeSpan` | `number`                                          |
| `scheduler?`     | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`[]\>

## Call Signature

```ts
function bufferTime<>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null | undefined,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;
```

Defined in: [rxjs/src/internal/operators/bufferTime.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/bufferTime.ts#L9)

### Parameters

| Parameter                | Type                                              |
| ------------------------ | ------------------------------------------------- |
| `bufferTimeSpan`         | `number`                                          |
| `bufferCreationInterval` | `number` \| `null` \| `undefined`                 |
| `scheduler?`             | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`[]\>

## Call Signature

```ts
function bufferTime<>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null | undefined,
  maxBufferSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;
```

Defined in: [rxjs/src/internal/operators/bufferTime.ts:14](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/bufferTime.ts#L14)

### Parameters

| Parameter                | Type                                              |
| ------------------------ | ------------------------------------------------- |
| `bufferTimeSpan`         | `number`                                          |
| `bufferCreationInterval` | `number` \| `null` \| `undefined`                 |
| `maxBufferSize`          | `number`                                          |
| `scheduler?`             | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`[]\>
