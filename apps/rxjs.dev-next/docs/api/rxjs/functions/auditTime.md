[API](../../index.md) / [rxjs](../index.md) / auditTime

# Function: auditTime()

```ts
function auditTime<>(duration: number, scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/auditTime.ts:53](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/auditTime.ts#L53)

Ignores source values for `duration` milliseconds, then emits the most recent
value from the source Observable, then repeats this process.

<span class="informal">When it sees a source value, it ignores that plus
the next ones for `duration` milliseconds, and then it emits the most recent
value from the source.</span>

![](/images/marble-diagrams/auditTime.png)

`auditTime` is similar to `throttleTime`, but emits the last value from the
silenced time window, instead of the first value. `auditTime` emits the most
recent value from the source Observable on the output Observable as soon as
its internal timer becomes disabled, and ignores source values while the
timer is enabled. Initially, the timer is disabled. As soon as the first
source value arrives, the timer is enabled. After `duration` milliseconds (or
the time unit determined internally by the optional `scheduler`) has passed,
the timer is disabled, then the most recent source value is emitted on the
output Observable, and this process repeats for the next source value.
Optionally takes a [SchedulerLike](../interfaces/SchedulerLike.md) for managing timers.

## Parameters

| Parameter   | Type                                              | Default value    | Description                                                                                                                                             |
| ----------- | ------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `duration`  | `number`                                          | `undefined`      | Time to wait before emitting the most recent source value, measured in milliseconds or the time unit determined internally by the optional `scheduler`. |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | `asyncScheduler` | The [SchedulerLike](../interfaces/SchedulerLike.md) to use for managing the timers that handle the rate-limiting behavior.                              |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that performs rate-limiting of
emissions from the source Observable.

## Example

Emit clicks at a rate of at most one click per second

```ts
import { fromEvent, auditTime } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(auditTime(1000));
result.subscribe((x) => console.log(x));
```

## See

- [audit](audit.md)
- [debounceTime](debounceTime.md)
- [delay](delay.md)
- [sampleTime](sampleTime.md)
- [throttleTime](throttleTime.md)
