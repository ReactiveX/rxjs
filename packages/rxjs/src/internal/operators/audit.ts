import type { Subscriber} from '@rxjs/observable';
import { operate, Observable, from } from '@rxjs/observable';
import type { MonoTypeOperatorFunction, ObservableInput } from '../types.js';

/**
 * Ignores source values for a duration determined by another Observable, then
 * emits the most recent value from the source Observable, then repeats this
 * process.
 *
 * <span class="informal">It's like {@link auditTime}, but the silencing
 * duration is determined by a second Observable.</span>
 *
 * ![](audit.svg)
 *
 * `audit` is similar to `throttle`, but emits the last value from the silenced
 * time window, instead of the first value. `audit` emits the most recent value
 * from the source Observable on the output Observable as soon as its internal
 * timer becomes disabled, and ignores source values while the timer is enabled.
 * Initially, the timer is disabled. As soon as the first source value arrives,
 * the timer is enabled by calling the `durationSelector` function with the
 * source value, which returns the "duration" Observable. When the duration
 * Observable emits a value, the timer is disabled, then the most
 * recent source value is emitted on the output Observable, and this process
 * repeats for the next source value.
 *
 * ## Example
 *
 * Emit clicks at a rate of at most one click per second
 *
 * ```ts
 * import { fromEvent, audit, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(audit(ev => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttle}
 *
 * @param durationSelector A function
 * that receives a value from the source Observable, for computing the silencing
 * duration, returned as an Observable or a Promise.
 * @return A function that returns an Observable that performs rate-limiting of
 * emissions from the source Observable.
 */
export function audit<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable((destination) => {
      let hasValue = false;
      let lastValue: T | null = null;
      let durationSubscriber: Subscriber<any> | null = null;
      let isComplete = false;

      const endDuration = () => {
        durationSubscriber?.unsubscribe();
        durationSubscriber = null;
        if (hasValue) {
          hasValue = false;
          const value = lastValue!;
          lastValue = null;
          destination.next(value);
        }
        isComplete && destination.complete();
      };

      const cleanupDuration = () => {
        durationSubscriber = null;
        isComplete && destination.complete();
      };

      source.subscribe(
        operate({
          destination,
          next: (value) => {
            hasValue = true;
            lastValue = value;
            if (!durationSubscriber) {
              from(durationSelector(value)).subscribe(
                (durationSubscriber = operate({
                  destination,
                  next: endDuration,
                  complete: cleanupDuration,
                }))
              );
            }
          },
          complete: () => {
            isComplete = true;
            (!hasValue || !durationSubscriber || durationSubscriber.closed) && destination.complete();
          },
        })
      );
    });
}
