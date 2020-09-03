/** @prettier */
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { asyncScheduler } from '../scheduler/async';
import { Observable } from '../Observable';
import { ThrottleConfig, defaultThrottleConfig } from './throttle';
import { MonoTypeOperatorFunction, SchedulerLike, TeardownLogic } from '../types';
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
  config: ThrottleConfig = defaultThrottleConfig
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => lift(source, new ThrottleTimeOperator(duration, scheduler, !!config.leading, !!config.trailing));
}

class ThrottleTimeOperator<T> implements Operator<T, T> {
  constructor(private duration: number, private scheduler: SchedulerLike, private leading: boolean, private trailing: boolean) {}

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler, this.leading, this.trailing));
  }
}

class ThrottleTimeSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription | null = null;
  private trailingValue: T | null = null;
  private hasTrailingValue = false;
  private isComplete = false;

  constructor(
    destination: Subscriber<T>,
    private duration: number,
    private scheduler: SchedulerLike,
    private leading: boolean,
    private trailing: boolean
  ) {
    super(destination);
  }

  protected _next(value: T) {
    const { destination } = this;
    if (this.throttled) {
      // There is already a throttle timer going,
      // we don't emit in this case.
      if (this.trailing) {
        // Update the trailing value, so that when the
        // throttle executes, it has a trailing value to emit.
        this.trailingValue = value;
        this.hasTrailingValue = true;
      }
    } else {
      if (this.leading) {
        // With the leading behavior, if we're not
        // throttled we can emit the value right away,
        // but then we have to start the throttle.
        destination.next(value);
      } else if (this.trailing) {
        // We're NOT leading, but we are trailing, then
        // we need to set the trailing value so once the throttle
        // is done we can emit it. We don't do this if we're leading
        // as well, because that would result in a double emission.
        this.trailingValue = value;
        this.hasTrailingValue = true;
      }

      this.throttle();
    }
  }

  /**
   * Schedules the throttle delay.
   */
  private throttle() {
    const { destination } = this;
    (destination as Subscription).add(
      (this.throttled = this.scheduler.schedule(() => {
        this.throttled = null;
        const { trailing, trailingValue, hasTrailingValue } = this;
        if (trailing && hasTrailingValue) {
          // We're trailing, so emit the trailing value if
          // we have one.
          this.hasTrailingValue = false;
          this.trailingValue = null;
          destination.next(trailingValue);

          // If we have emitted a value, though, we need
          // to make sure that we throttle to keep the emitted
          // values spaced out by the given throttle.
          this.throttle();
        }

        if (this.isComplete) {
          // The source completed, we can't get any more values
          // so we can complete, which will tear everything down.
          destination.complete();
        }
      }, this.duration))
    );
  }

  protected _complete() {
    this.isComplete = true;
    const { trailing, throttled, hasTrailingValue, destination } = this;
    // If we're not throttled, we close because there's clearly nothing we're waiting for.
    // If we're not using trailing values, we can close, because there couldn't be an trailing values
    // trapped that we want to emit. And even if we are using trailing values, if the source
    // completes, and we don't have a trailing value yet, we can complete because it cannot
    // possibly provide one at that poin.
    if (!throttled || !trailing || !hasTrailingValue) {
      destination.complete();
    }
    this.unsubscribe();
  }
}
