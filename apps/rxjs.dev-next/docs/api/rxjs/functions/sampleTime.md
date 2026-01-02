[API](../../index.md) / [rxjs](../index.md) / sampleTime

# Function: sampleTime()

```ts
function sampleTime<>(period: number, scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/sampleTime.ts:49](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/sampleTime.ts#L49)

Emits the most recently emitted value from the source Observable within
periodic time intervals.

<span class="informal">Samples the source Observable at periodic time
intervals, emitting what it samples.</span>

![](/images/marble-diagrams/sampleTime.png)

`sampleTime` periodically looks at the source Observable and emits whichever
value it has most recently emitted since the previous sampling, unless the
source has not emitted anything since the previous sampling. The sampling
happens periodically in time every `period` milliseconds (or the time unit
defined by the optional `scheduler` argument). The sampling starts as soon as
the output Observable is subscribed.

## Parameters

| Parameter   | Type                                              | Default value    | Description                                                                                                       |
| ----------- | ------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `period`    | `number`                                          | `undefined`      | The sampling period expressed in milliseconds or the time unit determined internally by the optional `scheduler`. |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | `asyncScheduler` | The [SchedulerLike](../interfaces/SchedulerLike.md) to use for managing the timers that handle the sampling.      |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that emits the results of
sampling the values emitted by the source Observable at the specified time
interval.

## Example

Every second, emit the most recent click at most once

```ts
import { fromEvent, sampleTime } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(sampleTime(1000));

result.subscribe((x) => console.log(x));
```

## See

- [auditTime](auditTime.md)
- [debounceTime](debounceTime.md)
- [delay](delay.md)
- [sample](sample.md)
- [throttleTime](throttleTime.md)
