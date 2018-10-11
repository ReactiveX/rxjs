import { Observable } from "rxjs/internal/Observable";
import { Operation, Sink, FObs, FOType, SinkArg } from "rxjs/internal/types";
import { lift } from "rxjs/internal/util/lift";
import { Subscription } from "rxjs/internal/Subscription";
import { subjectSource } from "rxjs/internal/Subject";
import { sourceAsObservable } from "rxjs/internal/util/sourceAsObservable";

/**
 * Branch out the source Observable values as a nested Observable with each
 * nested Observable emitting at most `windowSize` values.
 *
 * <span class="informal">It's like {@link bufferCount}, but emits a nested
 * Observable instead of an array.</span>
 *
 * ![](windowCount.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits windows every `startWindowEvery`
 * items, each containing no more than `windowSize` items. When the source
 * Observable completes or encounters an error, the output Observable emits
 * the current window and propagates the notification from the source
 * Observable. If `startWindowEvery` is not provided, then new windows are
 * started immediately at the start of the source and when each window completes
 * with size `windowSize`.
 *
 * ## Examples
 * Ignore every 3rd click event, starting from the first one
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowCount(3)),
 *   map(win => win.skip(1)), // skip first of every 3 clicks
 *   mergeAll(),              // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Ignore every 3rd click event, starting from the third one
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowCount(2, 3),
 *   mergeAll(),              // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link window}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link bufferCount}
 *
 * @param {number} windowSize The maximum number of values emitted by each
 * window.
 * @param {number} [startWindowEvery] Interval at which to start a new window.
 * For example if `startWindowEvery` is `2`, then a new window will be started
 * on every other value from the source. A new window is started at the
 * beginning of the source by default.
 * @return {Observable<Observable<T>>} An Observable of windows, which in turn
 * are Observable of values.
 * @method windowCount
 * @owner Observable
 */
export function windowCount<T>(
  windowSize: number,
  startWindowEvery: number = 0
): Operation<T, Observable<T>> {
  return lift((source: Observable<T>, dest: Sink<Observable<T>>, subs: Subscription) => {
    const _windows: FObs<T>[] = [ subjectSource<T>() ];
    let _count = 0;

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const startEvery = startWindowEvery > 0 ? startWindowEvery : windowSize;

        for (let i = 0; i < _windows.length && !subs.closed; i++) {
          _windows[i](FOType.NEXT, v, subs);
        }

        const c = _count - windowSize + 1;
        if (c >= 0 && c % startEvery === 0 && !subs.closed) {
          _windows.shift()(FOType.COMPLETE, undefined, subs);
        }

        if (++_count % startEvery === 0 && !subs.closed) {
          const window = subjectSource<T>();
          _windows.push(window);
          dest(FOType.NEXT, sourceAsObservable(window), subs);
        }
      } else {
        while (_windows.length > 0) {
          _windows.shift()(t, v, subs);
        }
        dest(t, v, subs);
      }
    }, subs);

    if (!subs.closed) {
      dest(FOType.NEXT, sourceAsObservable(_windows[0]), subs);
    }
  });
}
