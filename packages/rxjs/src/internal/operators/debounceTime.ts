import { asyncScheduler } from '../scheduler/async.js';
import type { Subscription } from '@rxjs/observable';
import { Observable, operate } from '@rxjs/observable';
import type { MonoTypeOperatorFunction, SchedulerLike } from '../types.js';
import { executeSchedule } from '../util/executeSchedule.js';

/**
 * Emits a notification from the source Observable only after a particular time span
 * has passed without another source emission.
 *
 * <span class="informal">It's like {@link delay}, but passes only the most
 * recent notification from each burst of emissions.</span>
 *
 * ![](debounceTime.png)
 *
 * `debounceTime` delays notifications emitted by the source Observable, but drops
 * previous pending delayed emissions if a new notification arrives on the source
 * Observable. This operator keeps track of the most recent notification from the
 * source Observable, and emits that only when `dueTime` has passed
 * without any other notification appearing on the source Observable. If a new value
 * appears before `dueTime` silence occurs, the previous notification will be dropped
 * and will not be emitted and a new `dueTime` is scheduled.
 * If the completing event happens during `dueTime` the last cached notification
 * is emitted before the completion event is forwarded to the output observable.
 * If the error event happens during `dueTime` or after it only the error event is
 * forwarded to the output observable. The cache notification is not emitted in this case.
 *
 * This is a rate-limiting operator, because it is impossible for more than one
 * notification to be emitted in any time window of duration `dueTime`, but it is also
 * a delay-like operator since output emissions do not occur at the same time as
 * they did on the source Observable. Optionally takes a {@link SchedulerLike} for
 * managing timers.
 *
 * ## Example
 *
 * Emit the most recent click after a burst of clicks
 *
 * ```ts
 * import { fromEvent, debounceTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(debounceTime(1000));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link audit}
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link sample}
 * @see {@link sampleTime}
 * @see {@link throttle}
 * @see {@link throttleTime}
 *
 * @param dueTime The timeout duration in milliseconds (or the time unit determined
 * internally by the optional `scheduler`) for the window of time required to wait
 * for emission silence before emitting the most recent source value.
 * @param scheduler The {@link SchedulerLike} to use for managing the timers that
 * handle the timeout for each value.
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified `dueTime`, and may drop some values
 * if they occur too frequently.
 */
export function debounceTime<T>(dueTime: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable((destination) => {
      let lastValue: T;
      let activeTask: Subscription | void;

      source.subscribe(
        operate({
          destination,
          next: (value: T) => {
            lastValue = value;
            // Clear any pending task and schedule a new one.
            activeTask?.unsubscribe();

            activeTask = executeSchedule(
              destination,
              scheduler,
              () => {
                activeTask = undefined;
                const v = lastValue;
                lastValue = null!;
                destination.next(v);
              },
              dueTime
            );
          },
          complete: () => {
            // Source completed.
            // Emit any pending debounced values then complete
            if (activeTask) {
              destination.next(lastValue);
            }
            destination.complete();
          },
          finalize: () => {
            // Finalization.
            lastValue = activeTask = null!;
          },
        })
      );
    });
}
