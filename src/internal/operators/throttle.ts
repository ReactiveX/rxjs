import { Operation, ObservableInput, Sink, FOType, SinkArg } from "rxjs/internal/types";
import { lift } from "rxjs/internal/util/lift";
import { Observable } from "rxjs/internal/Observable";
import { Subscription } from "rxjs/internal/Subscription";
import { tryUserFunction, resultIsError } from "rxjs/internal/util/userFunction";
import { fromSource } from "rxjs/internal/sources/fromSource";

export interface ThrottleConfig {
  leading?: boolean;
  trailing?: boolean;
}

export const defaultThrottleConfig: ThrottleConfig = {
  leading: true,
  trailing: false
};

/**
 * Emits a value from the source Observable, then ignores subsequent source
 * values for a duration determined by another Observable, then repeats this
 * process.
 *
 * <span class="informal">It's like {@link throttleTime}, but the silencing
 * duration is determined by a second Observable.</span>
 *
 * ![](throttle.png)
 *
 * `throttle` emits the source Observable values on the output Observable
 * when its internal timer is disabled, and ignores source values when the timer
 * is enabled. Initially, the timer is disabled. As soon as the first source
 * value arrives, it is forwarded to the output Observable, and then the timer
 * is enabled by calling the `durationSelector` function with the source value,
 * which returns the "duration" Observable. When the duration Observable emits a
 * value or completes, the timer is disabled, and this process repeats for the
 * next source value.
 *
 * ## Example
 * Emit clicks at a rate of at most one click per second
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(throttle(ev => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link audit}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttleTime}
 *
 * @param {function(value: T, index: number): SubscribableOrPromise} durationSelector A function
 * that receives a value from the source Observable, for computing the silencing
 * duration for each source value, returned as an Observable or a Promise.
 * @param {Object} config a configuration object to define `leading` and `trailing` behavior. Defaults
 * to `{ leading: true, trailing: false }`.
 * @return {Observable<T>} An Observable that performs the throttle operation to
 * limit the rate of emissions from the source.
 * @method throttle
 * @owner Observable
 */
export function throttle<T>(
  durationSelector: (value: T, index: number) => ObservableInput<any>,
  config = defaultThrottleConfig
): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let _innerSubs: Subscription;
    let _sendValue: T;
    let _hasValue = false;
    let _i = 0;

    const throttle = (value: T) => {
      const duration = tryUserFunction(() => fromSource(durationSelector(value, _i++)));
      if (resultIsError(duration)) {
        dest(FOType.ERROR, duration.error, subs);
      } else {
        _innerSubs = new Subscription();
        subs.add(_innerSubs);
        duration(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<any>, innerSubs: Subscription) => {
          if (t === FOType.ERROR) {
            dest(t, v, subs);
          } else {
            if (_innerSubs) {
              _innerSubs.unsubscribe();
            }
            _innerSubs = null;
            if (config.trailing) {
              send();
            }
          }
        }, _innerSubs);
      }
    };

    const send = () => {
      if (_hasValue) {
        dest(FOType.NEXT, _sendValue, subs);
        throttle(_sendValue);
      }
      _hasValue = false;
      _sendValue = null;
    };

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        _hasValue = true;
        _sendValue = v;
        if (!_innerSubs) {
          if (config.leading) {
            send();
          } else {
            throttle(v);
          }
        }
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
