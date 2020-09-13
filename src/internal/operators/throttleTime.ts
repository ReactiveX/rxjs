/** @prettier */
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { asyncScheduler } from '../scheduler/async';
import { Observable } from '../Observable';
import { ThrottleConfig, defaultThrottleConfig } from './throttle';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { lift } from '../util/lift';

/**
 * Emits a value from the source Observable, then ignores subsequent source
 * values for `duration` milliseconds, then repeats this process.
 *
 * <span class="informal">Lets a value pass, then ignores source values for the
 * next `duration` milliseconds.</span>
 *
 * ![](throttleTime.png)
 *
 * `throttleTime` emits the source Observable values on the output Observable
 * when its internal timer is disabled, and ignores source values when the timer
 * is enabled. Initially, the timer is disabled. As soon as the first source
 * value arrives, it is forwarded to the output Observable, and then the timer
 * is enabled. After `duration` milliseconds (or the time unit determined
 * internally by the optional `scheduler`) has passed, the timer is disabled,
 * and this process repeats for the next source value. Optionally takes a
 * {@link SchedulerLike} for managing timers.
 *
 * ## Examples
 *
 * #### Limit click rate
 *
 * Emit clicks at a rate of at most one click per second
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { throttleTime } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(throttleTime(1000));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * #### Double Click
 *
 * The following example only emits clicks which happen within a subsequent
 * delay of 400ms of the previous click. This for example can emulate a double
 * click. It makes use of the `trailing` parameter of the throttle configuration.
 *
 * ```ts
 * import { fromEvent, asyncScheduler } from 'rxjs';
 * import { throttleTime, withLatestFrom } from 'rxjs/operators';
 *
 * // defaultThottleConfig = { leading: true, trailing: false }
 * const throttleConfig = {
 *   leading: false,
 *   trailing: true
 * }
 *
 * const click = fromEvent(document, 'click');
 * const doubleClick = click.pipe(
 *   throttleTime(400, asyncScheduler, throttleConfig)
 * );
 *
 * doubleClick.subscribe((throttleValue: Event) => {
 *   console.log(`Double-clicked! Timestamp: ${throttleValue.timeStamp}`);
 * });
 * ```
 *
 * If you enable the `leading` parameter in this example, the output would be the primary click and
 * the double click, but restricts additional clicks within 400ms.
 *
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttle}
 *
 * @param duration Time to wait before emitting another value after
 * emitting the last value, measured in milliseconds or the time unit determined
 * internally by the optional `scheduler`.
 * @param scheduler The {@link SchedulerLike} to use for
 * managing the timers that handle the throttling. Defaults to {@link asyncScheduler}.
 * @param config a configuration object to define `leading` and
 * `trailing` behavior. Defaults to `{ leading: true, trailing: false }`.
 * @return An Observable that performs the throttle operation to
 * limit the rate of emissions from the source.
 */
export function throttleTime<T>(
  duration: number,
  scheduler: SchedulerLike = asyncScheduler,
  { leading = false, trailing = false }: ThrottleConfig = defaultThrottleConfig
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<T>, source: Observable<T>) {
      const subscriber = this;
      // Whether or not we have received a trailing value
      let hasTrailingValue = false;
      // The trailing value we have received
      let trailingValue: T | null = null;
      // The subscription for the scheduled throttle job.
      // If this is null, no throttle is currently scheduled.
      let throttleSubs: Subscription | null = null;
      // Whether or not the source has completed.
      let isComplete = false;

      /**
       * Executed when the throttled time completes.
       */
      const throttleJob = () => {
        // Clear the throttle subs, we check this to see if there's
        // A throttle scheduled already.
        throttleSubs = null;
        if (trailing && hasTrailingValue) {
          // If we have the trailing behavior, and we have a trailing value
          // then emit the trailing value. Emitting will start another throttle
          // peroid.
          hasTrailingValue = false;
          emit(trailingValue!);
          trailingValue = null;
        }
        if (isComplete) {
          subscriber.complete();
        }
      };

      /**
       * Does the work of scheduling the throttle job.
       */
      const startThrottle = () => subscriber.add((throttleSubs = scheduler.schedule(throttleJob, duration)));

      /**
       * Sets the trailing value if we have that behavior.
       */
      const setTrailing = (value: T) => {
        if (trailing) {
          hasTrailingValue = true;
          trailingValue = value;
        }
      };

      /**
       * Emits the value, and if the source is not complete,
       * it will schedule another throttle period.
       */
      const emit = (value: T) => {
        subscriber.next(value);
        if (!isComplete) {
          startThrottle();
        }
      };

      source.subscribe(
        new ThrottleTimeSubscriber(
          subscriber,
          (value) => {
            // We got a new value
            if (throttleSubs) {
              // We're already throttled, set the trailing value if we have to.
              setTrailing(value);
            } else {
              // We are not throttled yet.
              if (leading) {
                // If we have the leading behavior, emit right away and start
                // a new throttle period.
                emit(value);
              } else {
                // If we do not have the leading behavior,
                // set the trailing value and start a new throttle peroid.
                // If they don't have the leading behavior, we'll just assume
                // they have the trailing behavior here. We need to record the value
                // So it comes out after the throttle period. If they don't have
                // either behavior that is just weird. Not adding extra code for that.
                setTrailing(value);
                startThrottle();
              }
            }
          },
          () => {
            // The source completed
            isComplete = true;
            // If we're trailing, and we're in a throttle period and have a trailing value,
            // wait for the throttle period to end before we actually complete.
            // Otherwise, returning `true` here completes the result right away.
            return !trailing || !throttleSubs || !hasTrailingValue;
          }
        )
      );
    });
}

class ThrottleTimeSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, protected _next: (value: T) => void, protected shouldComplete: () => boolean) {
    super(destination);
  }

  _complete() {
    if (this.shouldComplete()) {
      super._complete();
    }
  }
}
