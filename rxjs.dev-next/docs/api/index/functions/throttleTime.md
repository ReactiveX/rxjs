[API](../../index.md) / [index](../index.md) / throttleTime

# Function: throttleTime()

```ts
function throttleTime<>(
   duration: number, 
   scheduler: SchedulerLike, 
config?: ThrottleConfig): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/throttleTime.ts:55](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/throttleTime.ts#L55)

Emits a value from the source Observable, then ignores subsequent source
values for `duration` milliseconds, then repeats this process.

<span class="informal">Lets a value pass, then ignores source values for the
next `duration` milliseconds.</span>

![](throttleTime.png)

`throttleTime` emits the source Observable values on the output Observable
when its internal timer is disabled, and ignores source values when the timer
is enabled. Initially, the timer is disabled. As soon as the first source
value arrives, it is forwarded to the output Observable, and then the timer
is enabled. After `duration` milliseconds (or the time unit determined
internally by the optional `scheduler`) has passed, the timer is disabled,
and this process repeats for the next source value. Optionally takes a
[SchedulerLike](../interfaces/SchedulerLike.md) for managing timers.

## Examples

### Limit click rate

Emit clicks at a rate of at most one click per second

```ts
import { fromEvent, throttleTime } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(throttleTime(1000));

result.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `duration` | `number` | `undefined` | Time to wait before emitting another value after emitting the last value, measured in milliseconds or the time unit determined internally by the optional `scheduler`. |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | `asyncScheduler` | The [SchedulerLike](../interfaces/SchedulerLike.md) to use for managing the timers that handle the throttling. Defaults to [asyncScheduler](../variables/asyncScheduler.md). |
| `config?` | [`ThrottleConfig`](../interfaces/ThrottleConfig.md) | `undefined` | A configuration object to define `leading` and `trailing` behavior. Defaults to `{ leading: true, trailing: false }`. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that performs the throttle
operation to limit the rate of emissions from the source.

## See

 - [auditTime](auditTime.md)
 - [debounceTime](debounceTime.md)
 - [delay](delay.md)
 - [sampleTime](sampleTime.md)
 - [throttle](throttle.md)
