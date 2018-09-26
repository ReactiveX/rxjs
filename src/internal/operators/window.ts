import { lift } from '../util/lift';
import { Observable } from '../Observable';
import { Operation, Sink, FOType, SinkArg, FObs } from '../types';
import { Subscription } from '../Subscription';
import { subjectBaseSource } from '../sources/subjectBaseSource';
import { sourceAsObservable } from '../util/sourceAsObservable';

/**
 * Branch out the source Observable values as a nested Observable whenever
 * `windowBoundaries` emits.
 *
 * <span class="informal">It's like {@link buffer}, but emits a nested Observable
 * instead of an array.</span>
 *
 * ![](window.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits connected, non-overlapping
 * windows. It emits the current window and opens a new one whenever the
 * Observable `windowBoundaries` emits an item. Because each window is an
 * Observable, the output is a higher-order Observable.
 *
 * ## Example
 * In every window of 1 second each, emit at most 2 click events
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const interval = interval(1000);
 * const result = clicks.pipe(
 *   window(interval),
 *   map(win => win.take(2)), // each window has at most 2 emissions
 *   mergeAll(),              // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link buffer}
 *
 * @param {Observable<any>} windowBoundaries An Observable that completes the
 * previous window and starts a new window.
 * @return {Observable<Observable<T>>} An Observable of windows, which are
 * Observables emitting values of the source Observable.
 * @method window
 * @owner Observable
 */
export function window<T>(windowBoundaries: Observable<any>): Operation<T, Observable<T>> {
  return lift((source: Observable<T>, dest: Sink<Observable<T>>, subs: Subscription) => {
    let currentWindow: FObs<T>;
    const openWindow = () => {
      currentWindow = subjectBaseSource<T>();
      dest(FOType.NEXT, sourceAsObservable(currentWindow), subs);
    };
    openWindow();

    const boundarySubs = new Subscription();
    subs.add(boundarySubs);
    windowBoundaries(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<any>, boundarySubs: Subscription) => {
      if (t === FOType.NEXT) {
        currentWindow(FOType.COMPLETE, undefined, boundarySubs);
        openWindow();
      } else {
        currentWindow(t, v, boundarySubs);
        dest(t, v, subs);
        subs.unsubscribe();
      }
    }, boundarySubs);

    if (!subs.closed) {
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
        currentWindow(t, v, boundarySubs);
        if (t !== FOType.NEXT) {
          dest(t, v, subs);
          subs.unsubscribe();
        }
      }, subs);
    }
  });
}
