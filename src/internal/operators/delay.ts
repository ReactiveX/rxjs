/** @prettier */
import { asyncScheduler } from '../scheduler/async';
import { isValidDate } from '../util/isDate';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { lift } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

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
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { delay } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(delay(1000)); // each click emitted after 1 second
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * Delay all clicks until a future date happens
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { delay } from 'rxjs/operators';
 *
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
 */
export function delay<T>(delay: number | Date, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  // TODO: Properly handle negative delays and dates in the past.
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<T>, source: Observable<T>) {
      const subscriber = this;
      const isAbsoluteDelay = isValidDate(delay);
      // If the source is complete
      let isComplete = false;
      // The number of active delays in progress.
      let active = 0;
      // For absolute time delay, we collect the values in this array and emit
      // them when the delay fires.
      let absoluteTimeValues: T[] | null = isAbsoluteDelay ? [] : null;

      /**
       * Used to check to see if we should complete the resulting
       * subscription after delays finish or when the source completes.
       * We don't want to complete when the source completes if we
       * have delays in flight.
       */
      const checkComplete = () => isComplete && !active && !absoluteTimeValues?.length && subscriber.complete();

      if (isAbsoluteDelay) {
        // A date was passed. We only do one delay, so let's get it
        // scheduled right away.
        active++;
        subscriber.add(
          scheduler.schedule(() => {
            active--;
            if (absoluteTimeValues) {
              const values = absoluteTimeValues;
              absoluteTimeValues = null;
              for (const value of values) {
                subscriber.next(value);
              }
            }
            checkComplete();
          }, +delay - scheduler.now())
        );
      }

      // Subscribe to the source
      source.subscribe(
        new OperatorSubscriber(
          subscriber,
          (value) => {
            if (isAbsoluteDelay) {
              // If we're dealing with an absolute time (via Date) delay, then before
              // the delay fires, the `absoluteTimeValues` array will be present, and
              // we want to add them to that. Otherwise, if it's `null`, that is because
              // the delay has already fired.
              absoluteTimeValues ? absoluteTimeValues.push(value) : subscriber.next(value);
            } else {
              active++;
              subscriber.add(
                scheduler.schedule(() => {
                  active--;
                  subscriber.next(value);
                  checkComplete();
                }, delay as number)
              );
            }
          },
          // Allow errors to pass through.
          undefined,
          () => {
            isComplete = true;
            checkComplete();
          }
        )
      );

      // Additional teardown. The other teardown is set up
      // implicitly by subscribing with Subscribers.
      return () => {
        // Release the buffered values.
        absoluteTimeValues = null!;
      };
    });
}
