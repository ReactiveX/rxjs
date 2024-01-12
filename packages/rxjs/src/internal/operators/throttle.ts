import type { Subscription } from '@rxjs/observable';
import { Observable, operate, from } from '@rxjs/observable';
import type { MonoTypeOperatorFunction, ObservableInput } from '../types.js';

/**
 * An object interface used by {@link throttle} or {@link throttleTime} that ensure
 * configuration options of these operators.
 *
 * @see {@link throttle}
 * @see {@link throttleTime}
 */
export interface ThrottleConfig {
  /**
   * If `true`, the resulting Observable will emit the first value from the source
   * Observable at the **start** of the "throttling" process (when starting an
   * internal timer that prevents other emissions from the source to pass through).
   * If `false`, it will not emit the first value from the source Observable at the
   * start of the "throttling" process.
   *
   * If not provided, defaults to: `true`.
   */
  leading?: boolean;
  /**
   * If `true`, the resulting Observable will emit the last value from the source
   * Observable at the **end** of the "throttling" process (when ending an internal
   * timer that prevents other emissions from the source to pass through).
   * If `false`, it will not emit the last value from the source Observable at the
   * end of the "throttling" process.
   *
   * If not provided, defaults to: `false`.
   */
  trailing?: boolean;
}

/**
 * Emits a value from the source Observable, then ignores subsequent source
 * values for a duration determined by another Observable, then repeats this
 * process.
 *
 * <span class="informal">It's like {@link throttleTime}, but the silencing
 * duration is determined by a second Observable.</span>
 *
 * ![](throttle.svg)
 *
 * `throttle` emits the source Observable values on the output Observable
 * when its internal timer is disabled, and ignores source values when the timer
 * is enabled. Initially, the timer is disabled. As soon as the first source
 * value arrives, it is forwarded to the output Observable, and then the timer
 * is enabled by calling the `durationSelector` function with the source value,
 * which returns the "duration" Observable. When the duration Observable emits a
 * value, the timer is disabled, and this process repeats for the
 * next source value.
 *
 * ## Example
 *
 * Emit clicks at a rate of at most one click per second
 *
 * ```ts
 * import { fromEvent, throttle, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(throttle(() => interval(1000)));
 *
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link audit}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttleTime}
 *
 * @param durationSelector A function that receives a value from the source
 * Observable, for computing the silencing duration for each source value,
 * returned as an `ObservableInput`.
 * @param config A configuration object to define `leading` and `trailing`
 * behavior. Defaults to `{ leading: true, trailing: false }`.
 * @return A function that returns an Observable that performs the throttle
 * operation to limit the rate of emissions from the source.
 */
export function throttle<T>(durationSelector: (value: T) => ObservableInput<any>, config?: ThrottleConfig): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable((destination) => {
      const { leading = true, trailing = false } = config ?? {};
      let hasValue = false;
      let sendValue: T | null = null;
      let throttled: Subscription | null = null;
      let isComplete = false;

      const endThrottling = () => {
        throttled?.unsubscribe();
        throttled = null;
        if (trailing) {
          send();
          isComplete && destination.complete();
        }
      };

      const cleanupThrottling = () => {
        throttled = null;
        isComplete && destination.complete();
      };

      const startThrottle = (value: T) =>
        (throttled = from(durationSelector(value)).subscribe(operate({ destination, next: endThrottling, complete: cleanupThrottling })));

      const send = () => {
        if (hasValue) {
          // Ensure we clear out our value and hasValue flag
          // before we emit, otherwise reentrant code can cause
          // issues here.
          hasValue = false;
          const value = sendValue!;
          sendValue = null;
          // Emit the value.
          destination.next(value);
          !isComplete && startThrottle(value);
        }
      };

      source.subscribe(
        operate({
          destination,
          // Regarding the presence of throttled.closed in the following
          // conditions, if a synchronous duration selector is specified - weird,
          // but legal - an already-closed subscription will be assigned to
          // throttled, so the subscription's closed property needs to be checked,
          // too.
          next: (value) => {
            hasValue = true;
            sendValue = value;
            !(throttled && !throttled.closed) && (leading ? send() : startThrottle(value));
          },
          complete: () => {
            isComplete = true;
            !(trailing && hasValue && throttled && !throttled.closed) && destination.complete();
          },
        })
      );
    });
}
