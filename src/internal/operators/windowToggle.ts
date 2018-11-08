import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction, Sink, FOType, SinkArg, FObs } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { subjectSource } from 'rxjs/internal/Subject';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';

/**
 * Branch out the source Observable values as a nested Observable starting from
 * an emission from `openings` and ending when the output of `closingSelector`
 * emits.
 *
 * <span class="informal">It's like {@link bufferToggle}, but emits a nested
 * Observable instead of an array.</span>
 *
 * ![](windowToggle.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits windows that contain those items
 * emitted by the source Observable between the time when the `openings`
 * Observable emits an item and when the Observable returned by
 * `closingSelector` emits an item.
 *
 * ## Example
 * Every other second, emit the click events from the next 500ms
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const openings = interval(1000);
 * const result = clicks.pipe(
 *   windowToggle(openings, i => i % 2 ? interval(500) : empty()),
 *   mergeAll(),
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowWhen}
 * @see {@link bufferToggle}
 *
 * @param {Observable<O>} openings An observable of notifications to start new
 * windows.
 * @param {function(value: O): Observable} closingSelector A function that takes
 * the value emitted by the `openings` observable and returns an Observable,
 * which, when it emits (either `next` or `complete`), signals that the
 * associated window should complete.
 * @return {Observable<Observable<T>>} An observable of windows, which in turn
 * are Observables.
 * @method windowToggle
 * @owner Observable
 */
export function windowToggle<T, O>(
  openings: Observable<O>,
  closingSelector: (openValue: O) => Observable<any>
): OperatorFunction<T, Observable<T>> {
  return lift((source: Observable<T>, dest: Sink<Observable<T>>, subs: Subscription) => {
    const _windows: FObs<T>[] = [];
    let _openSubs = new Subscription();
    subs.add(_openSubs);

    const notifyWindows = (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      const copy = _windows.slice();
      for (let i = 0; i < copy.length; i++) {
        copy[i](t, v, subs);
      }
    };

    const notifyError = (err: any) => {
      notifyWindows(FOType.ERROR, err, subs);
      dest(FOType.ERROR, err, subs);
    };

    openings(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<O>, _openSubs: Subscription) => {
      if (t === FOType.NEXT) {
        const closing = tryUserFunction(closingSelector, v);
        if (resultIsError(closing)) {
          notifyError(closing.error);
        } else {
          const window = subjectSource<T>();
          const cSubs = new Subscription();
          subs.add(cSubs);
          _windows.push(window);
          dest(FOType.NEXT, sourceAsObservable(window), subs);

          closing(FOType.SUBSCRIBE, (tc: FOType, vc: SinkArg<any>, cSubs: Subscription) => {
            if (tc === FOType.ERROR) {
              notifyError(vc);
            } else {
              window(FOType.COMPLETE, undefined, subs);
              cSubs.unsubscribe();
              const i = _windows.indexOf(window);
              _windows.splice(i, 1);
            }
          }, cSubs);

        }
      } else if (t === FOType.ERROR) {
        notifyError(v);
      }
    }, _openSubs);

    // source subscription
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      notifyWindows(t, v, subs);
      if (t !== FOType.NEXT) {
        dest(t, v, subs);
      }
    }, subs);
  });
}
