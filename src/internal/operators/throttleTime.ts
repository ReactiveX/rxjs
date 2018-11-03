import { SchedulerLike, OperatorFunction, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { ThrottleConfig, DEFAULT_THROTTLE_CONFIG } from 'rxjs/internal/operators/throttle';
import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';

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
 * ## Example
 * Emit clicks at a rate of at most one click per second
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(throttleTime(1000));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttle}
 *
 * @param {number} duration Time to wait before emitting another value after
 * emitting the last value, measured in milliseconds or the time unit determined
 * internally by the optional `scheduler`.
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the throttling.
 * @param {Object} config a configuration object to define `leading` and
 * `trailing` behavior. Defaults to `{ leading: true, trailing: false }`.
 * @return {Observable<T>} An Observable that performs the throttle operation to
 * limit the rate of emissions from the source.
 * @method throttleTime
 * @owner Observable
 */
export function throttleTime<T>(
  duration: number,
  scheduler: SchedulerLike = asyncScheduler,
  config: ThrottleConfig = DEFAULT_THROTTLE_CONFIG
): OperatorFunction<T, T>
{
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let _hasTrailingValue = false;
    let _trailingValue: T;
    let _throttled = false;
    const { leading, trailing } = config;

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        if (_throttled) {
          if (trailing) {
            _trailingValue = v;
            _hasTrailingValue = true;
          }
        } else {
          _throttled = true;
          scheduler.schedule(() => {
            if (_throttled) {
              if (trailing && _hasTrailingValue) {
                dest(FOType.NEXT, _trailingValue, subs);
                _trailingValue = null;
                _hasTrailingValue = false;
              }
              _throttled = false;
            }
          }, duration, undefined, subs);

          if (leading) {
            dest(FOType.NEXT, v, subs);
          }
        }
      } else {
        if (t === FOType.COMPLETE && _hasTrailingValue) {
          dest(FOType.NEXT, _trailingValue, subs);
        }
        dest(t, v, subs);
      }
    }, subs);
  });
}
