import { ObservableInput, Operation, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { fromSource } from 'rxjs/internal/sources/fromSource';

/**
 * Ignores source values for a duration determined by another Observable, then
 * emits the most recent value from the source Observable, then repeats this
 * process.
 *
 * <span class="informal">It's like {@link auditTime}, but the silencing
 * duration is determined by a second Observable.</span>
 *
 * ![](audit.png)
 *
 * `audit` is similar to `throttle`, but emits the last value from the silenced
 * time window, instead of the first value. `audit` emits the most recent value
 * from the source Observable on the output Observable as soon as its internal
 * timer becomes disabled, and ignores source values while the timer is enabled.
 * Initially, the timer is disabled. As soon as the first source value arrives,
 * the timer is enabled by calling the `durationSelector` function with the
 * source value, which returns the "duration" Observable. When the duration
 * Observable emits a value or completes, the timer is disabled, then the most
 * recent source value is emitted on the output Observable, and this process
 * repeats for the next source value.
 *
 * ## Example
 *
 * Emit clicks at a rate of at most one click per second
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(audit(ev => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttle}
 *
 * @param {function(value: T): ObservableInput} durationSelector A function
 * that receives a value from the source Observable, for computing the silencing
 * duration, returned as an Observable or a Promise.
 * @return {Observable<T>} An Observable that performs rate-limiting of
 * emissions from the source Observable.
 * @method audit
 * @owner Observable
 */
export function audit<T>(durationSelector: (value: T) => ObservableInput<any>): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let notifierSubs: Subscription|undefined = undefined;
    let _lastValue: T|null = null;
    let _hasValue = false;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        _hasValue = true;
        _lastValue = v;
        if (!notifierSubs) {
          notifierSubs = new Subscription();
          subs.add(notifierSubs);
          let notifier = tryUserFunction(() => fromSource(durationSelector(v)));
          if (resultIsError(notifier)) {
            dest(FOType.ERROR, notifier.error, subs);
            notifierSubs = undefined;
            subs.unsubscribe();
          } else {
            notifier(FOType.SUBSCRIBE, (ti: FOType, tv: SinkArg<any>) => {
              if (ti === FOType.NEXT || ti === FOType.COMPLETE) {
                if (_hasValue) {
                  const lastValue = _lastValue;
                  _lastValue = null;
                  _hasValue = false;
                  notifierSubs.unsubscribe();
                  notifierSubs = undefined;
                  dest(FOType.NEXT, lastValue, subs);
                }
              } else if (ti === FOType.ERROR) {
                dest(FOType.ERROR, tv, subs);
                subs.unsubscribe();
              }
            }, notifierSubs);
          }
        }
      } else {
        dest(t, v, subs);
        subs.unsubscribe();
      }
    }, subs);
  });
}
