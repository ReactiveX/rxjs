import { OperatorFunction, SchedulerLike } from 'rxjs/internal/types';
import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { mapTo } from 'rxjs/internal/operators/derived/mapTo';
import { timer } from 'rxjs/internal/create/timer';
import { isNumeric } from 'rxjs/internal/util/isNumeric';

/**
 * Delays the emission of items from the source Observable by a given timeout or
 * until a given Date.
 *
 * <span class="informal">Time shifts each item by some specified amount of
 * milliseconds.</span>
 *
 * ![](delay.png)
 *
 * If the delay argument is a Number, this operator time shifts the source
 * Observable by that amount of time expressed in milliseconds. The relative
 * time intervals between the values are preserved.
 *
 * If the delay argument is a Date, this operator time shifts the start of the
 * Observable execution until the given date occurs.
 *
 * ## Examples
 * Delay each click by one second
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(delay(1000)); // each click emitted after 1 second
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * Delay all clicks until a future date happens
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const date = new Date('March 15, 2050 12:00:00'); // in the future
 * const delayedClicks = clicks.pipe(delay(date)); // click emitted only after that date
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link debounceTime}
 * @see {@link delayWhen}
 *
 * @param {number|Date} delay The delay duration in milliseconds (a `number`) or
 * a `Date` until which the emission of the source items is delayed.
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the time-shift for each item.
 * @return {Observable} An Observable that delays the emissions of the source
 * Observable by the specified timeout or Date.
 * @method delay
 * @owner Observable
 */
export function delay<T>(delay: number|Date, scheduler: SchedulerLike = asyncScheduler): OperatorFunction<T, T> {
  const delayFor = !isNumeric(delay) ? (+delay - scheduler.now()) : Math.abs(delay);

  return mergeMap((value: T) => timer(delayFor, scheduler).pipe(mapTo(value)));
}
