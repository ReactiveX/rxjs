[API](../../index.md) / [rxjs](../index.md) / interval

# Function: interval()

```ts
function interval(period: number, scheduler: SchedulerLike): Observable<number>;
```

Defined in: [rxjs/src/internal/observable/interval.ts:50](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/interval.ts#L50)

Creates an Observable that emits sequential numbers every specified
interval of time, on a specified [SchedulerLike](../interfaces/SchedulerLike.md).

<span class="informal">Emits incremental numbers periodically in time.</span>

![](/images/marble-diagrams/interval.png)

`interval` returns an Observable that emits an infinite sequence of
ascending integers, with a constant interval of time of your choosing
between those emissions. The first emission is not sent immediately, but
only after the first period has passed. By default, this operator uses the
`asyncScheduler` [SchedulerLike](../interfaces/SchedulerLike.md) to provide a notion of time, but you may pass any
[SchedulerLike](../interfaces/SchedulerLike.md) to it.

## Parameters

| Parameter   | Type                                              | Default value    | Description                                                                                                                         |
| ----------- | ------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `period`    | `number`                                          | `0`              | The interval size in milliseconds (by default) or the time unit determined by the scheduler's clock.                                |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | `asyncScheduler` | The [SchedulerLike](../interfaces/SchedulerLike.md) to use for scheduling the emission of values, and providing a notion of "time". |

## Returns

[`Observable`](../classes/Observable.md)\<`number`\>

An Observable that emits a sequential number each time interval.

## Example

Emits ascending numbers, one every second (1000ms) up to the number 3

```ts
import { interval, take } from 'rxjs';

const numbers = interval(1000);

const takeFourNumbers = numbers.pipe(take(4));

takeFourNumbers.subscribe((x) => console.log('Next: ', x));

// Logs:
// Next: 0
// Next: 1
// Next: 2
// Next: 3
```

## See

- [timer](timer.md)
- [delay](delay.md)
