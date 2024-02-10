import { asyncScheduler } from '../scheduler/async';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { delayWhen } from './delayWhen';
import { timer } from '../observable/timer';
import { Observable } from '../Observable';

/**
 * Delays the emission of items from the source Observable by a given timeout or
 * until a given Date.
 *
 * <span class="informal">Time shifts each item by some specified amount of
 * milliseconds, even for very long periods.</span>
 *
 * ![](delay.svg)
 *
 * If the delay argument is a Number, this operator time shifts the source
 * Observable by that amount of time expressed in milliseconds. The relative
 * time intervals between the values are preserved. For delays longer than 2147483647 ms (~24.9 days),
 * the delay is segmented to avoid JavaScript timer limitations.
 *
 * If the delay argument is a Date, this operator time shifts the start of the
 * Observable execution until the given date occurs. It correctly handles dates far in the future.
 *
 * ## Examples
 *
 * Delay each click by one second
 *
 * ```ts
 * import { fromEvent, delay } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(delay(1000)); // each click emitted after 1 second
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * Delay all clicks until a future date happens
 *
 * ```ts
 * import { fromEvent, delay } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const date = new Date('March 15, 2050 12:00:00'); // in the future
 * const delayedClicks = clicks.pipe(delay(date)); // click emitted only after that date
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link delayWhen}
 * @see {@link throttle}
 * @see {@link throttleTime}
 * @see {@link debounce}
 * @see {@link debounceTime}
 * @see {@link sample}
 * @see {@link sampleTime}
 * @see {@link audit}
 * @see {@link auditTime}
 *
 * @param due The delay duration in milliseconds (a `number`) or a `Date` until
 * which the emission of the source items is delayed.
 * @param scheduler The {@link SchedulerLike} to use for managing the timers
 * that handle the time-shift for each item, with support for long delays.
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified timeout or Date, correctly handling long delays.
 */
export function delay<T>(due: number | Date, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  // Helper function to handle long delays
  function delaySegmented(dueTime: number, action: () => void, scheduler: SchedulerLike) {
    if (dueTime <= 2_147_483_647) {
      scheduler.schedule(action, dueTime);
    } else {
      // Schedule the first segment up to the maximum limit
      scheduler.schedule(() => {
        // Calculate the remaining time and apply recursively
        const remainingTime = dueTime - 2_147_483_647;
        delaySegmented(remainingTime, action, scheduler);
      }, 2_147_483_647);
    }
  }

  const dueTime = due instanceof Date ? due.getTime() - Date.now() : due;
  return delayWhen(() => new Observable<T>((subscriber) => {
    delaySegmented(dueTime, () => subscriber.complete(), scheduler);
  }));
}
