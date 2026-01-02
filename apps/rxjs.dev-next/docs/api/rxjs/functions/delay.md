[API](../../index.md) / [rxjs](../index.md) / delay

# Function: delay()

```ts
function delay<>(due: number | Date, scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/delay.ts:62](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/delay.ts#L62)

Delays the emission of items from the source Observable by a given timeout or
until a given Date.

<span class="informal">Time shifts each item by some specified amount of
milliseconds.</span>

<div><img class="only-light" src="/images/marble-diagrams/delay-light.svg" alt="Marble diagram" />
<img class="only-dark" src="/images/marble-diagrams/delay-dark.svg" alt="Marble diagram" /></div>

If the delay argument is a Number, this operator time shifts the source
Observable by that amount of time expressed in milliseconds. The relative
time intervals between the values are preserved.

If the delay argument is a Date, this operator time shifts the start of the
Observable execution until the given date occurs.

## Parameters

| Parameter   | Type                                              | Default value    | Description                                                                                                                  |
| ----------- | ------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `due`       | `number` \| `Date`                                | `undefined`      | The delay duration in milliseconds (a `number`) or a `Date` until which the emission of the source items is delayed.         |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | `asyncScheduler` | The [SchedulerLike](../interfaces/SchedulerLike.md) to use for managing the timers that handle the time-shift for each item. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that delays the emissions of
the source Observable by the specified timeout or Date.

## Example

Delay each click by one second

```ts
import { fromEvent, delay } from 'rxjs';

const clicks = fromEvent(document, 'click');
const delayedClicks = clicks.pipe(delay(1000)); // each click emitted after 1 second
delayedClicks.subscribe((x) => console.log(x));
```

Delay all clicks until a future date happens

```ts
import { fromEvent, delay } from 'rxjs';

const clicks = fromEvent(document, 'click');
const date = new Date('March 15, 2050 12:00:00'); // in the future
const delayedClicks = clicks.pipe(delay(date)); // click emitted only after that date
delayedClicks.subscribe((x) => console.log(x));
```

## See

- [delayWhen](delayWhen.md)
- [throttle](throttle.md)
- [throttleTime](throttleTime.md)
- [debounce](debounce.md)
- [debounceTime](debounceTime.md)
- [sample](sample.md)
- [sampleTime](sampleTime.md)
- [audit](audit.md)
- [auditTime](auditTime.md)
