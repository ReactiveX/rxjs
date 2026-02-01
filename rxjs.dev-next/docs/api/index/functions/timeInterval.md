[API](../../index.md) / [index](../index.md) / timeInterval

# Function: timeInterval()

```ts
function timeInterval<>(scheduler: SchedulerLike): OperatorFunction<T, TimeInterval<T>>;
```

Defined in: [internal/operators/timeInterval.ts:45](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/timeInterval.ts#L45)

Emits an object containing the current value, and the time that has
passed between emitting the current value and the previous value, which is
calculated by using the provided `scheduler`'s `now()` method to retrieve
the current time at each emission, then calculating the difference. The `scheduler`
defaults to [asyncScheduler](../variables/asyncScheduler.md), so by default, the `interval` will be in
milliseconds.

<span class="informal">Convert an Observable that emits items into one that
emits indications of the amount of time elapsed between those emissions.</span>

![](timeInterval.png)

## Example

Emit interval between current value with the last value

```ts
import { interval, timeInterval } from 'rxjs';

const seconds = interval(1000);

seconds
  .pipe(timeInterval())
  .subscribe(value => console.log(value));

// NOTE: The values will never be this precise,
// intervals created with `interval` or `setInterval`
// are non-deterministic.

// { value: 0, interval: 1000 }
// { value: 1, interval: 1000 }
// { value: 2, interval: 1000 }
```

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | `asyncScheduler` | Scheduler used to get the current time. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `TimeInterval`\<`T`\>\>

A function that returns an Observable that emits information about
value and interval.
