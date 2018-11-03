import { ObservableInput, OperatorFunction, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { fromSource } from 'rxjs/internal/sources/fromSource';

/**
 * Emits a value from the source Observable only after a particular time span
 * determined by another Observable has passed without another source emission.
 *
 * <span class="informal">It's like {@link debounceTime}, but the time span of
 * emission silence is determined by a second Observable.</span>
 *
 * ![](debounce.png)
 *
 * `debounce` delays values emitted by the source Observable, but drops previous
 * pending delayed emissions if a new value arrives on the source Observable.
 * This operator keeps track of the most recent value from the source
 * Observable, and spawns a duration Observable by calling the
 * `durationSelector` function. The value is emitted only when the duration
 * Observable emits a value or completes, and if no other value was emitted on
 * the source Observable since the duration Observable was spawned. If a new
 * value appears before the duration Observable emits, the previous value will
 * be dropped and will not be emitted on the output Observable.
 *
 * Like {@link debounceTime}, this is a rate-limiting operator, and also a
 * delay-like operator since output emissions do not necessarily occur at the
 * same time as they did on the source Observable.
 *
 * ## Example
 * Emit the most recent click after a burst of clicks
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(debounce(() => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link audit}
 * @see {@link debounceTime}
 * @see {@link delayWhen}
 * @see {@link throttle}
 *
 * @param {function(value: T, index: number): SubscribableOrPromise} durationSelector A function
 * that receives a value from the source Observable, for computing the timeout
 * duration for each source value, returned as an Observable or a Promise.
 * @return {Observable} An Observable that delays the emissions of the source
 * Observable by the specified duration Observable returned by
 * `durationSelector`, and may drop some values if they occur too frequently.
 * @method debounce
 * @owner Observable
 */
export function debounce<T>(durationSelector: (value: T, index: number) => ObservableInput<any>): OperatorFunction<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let _innerSubs: Subscription;
    let _i = 0;
    let _hasValue = false;
    let _lastValue: T;

    const emitValue = () => {
      if (_hasValue) {
        if (_innerSubs) {
          const innerSubs = _innerSubs;
          _innerSubs = null;
          innerSubs.unsubscribe();
        }
        const v = _lastValue;
        _hasValue = false;
        _lastValue = null;
        dest(FOType.NEXT, v, subs);
      }
    }

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        _hasValue = true;
        _lastValue = v;
        if (_innerSubs) {
          _innerSubs.unsubscribe();
        }
        _innerSubs = new Subscription();
        subs.add(_innerSubs);
        const result = tryUserFunction(() => fromSource(durationSelector(v, _i++)));
        if (resultIsError(result)) {
          dest(FOType.ERROR, result.error, subs);
        } else {
          result(FOType.SUBSCRIBE, (ti: FOType, vi: SinkArg<any>, innerSubs: Subscription) => {
            if (ti === FOType.ERROR) {
              dest(ti, vi, subs);
            } else {
              emitValue();
            }
          }, _innerSubs);
        }
      } else {
        if (_hasValue && t === FOType.COMPLETE) {
          dest(FOType.NEXT, _lastValue, subs);
        }
        dest(t, v, subs);
      }
    }, subs);
  });
};
