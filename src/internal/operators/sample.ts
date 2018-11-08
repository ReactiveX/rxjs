import { OperatorFunction, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from 'rxjs/internal/Subscription';

/**
 * Emits the most recently emitted value from the source Observable whenever
 * another Observable, the `notifier`, emits.
 *
 * <span class="informal">It's like {@link sampleTime}, but samples whenever
 * the `notifier` Observable emits something.</span>
 *
 * ![](sample.png)
 *
 * Whenever the `notifier` Observable emits a value or completes, `sample`
 * looks at the source Observable and emits whichever value it has most recently
 * emitted since the previous sampling, unless the source has not emitted
 * anything since the previous sampling. The `notifier` is subscribed to as soon
 * as the output Observable is subscribed.
 *
 * ## Example
 * On every click, sample the most recent "seconds" timer
 * ```javascript
 * const seconds = interval(1000);
 * const clicks = fromEvent(document, 'click');
 * const result = seconds.pipe(sample(clicks));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link audit}
 * @see {@link debounce}
 * @see {@link sampleTime}
 * @see {@link throttle}
 *
 * @param {Observable<any>} notifier The Observable to use for sampling the
 * source Observable.
 * @return {Observable<T>} An Observable that emits the results of sampling the
 * values emitted by the source Observable whenever the notifier Observable
 * emits value or completes.
 * @method sample
 * @owner Observable
 */
export function sample<T>(notifier: Observable<any>): OperatorFunction<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let _value: T;
    let _hasValue = false;

    const notifierSubs = new Subscription();
    subs.add(notifierSubs);

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        _hasValue = true;
        _value = v;
      } else {
        dest(t, v, subs);
      }
    }, subs);

    notifier(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, notifierSubs: Subscription) => {
      if (t === FOType.ERROR) {
        dest(FOType.ERROR, v, subs);
      } else if (_hasValue) {
        _hasValue = false;
        dest(FOType.NEXT, _value, subs);
      }
    }, notifierSubs);
  });
}
