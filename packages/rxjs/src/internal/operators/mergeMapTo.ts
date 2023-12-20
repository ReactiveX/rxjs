import type { OperatorFunction, ObservedValueOf, ObservableInput } from '../types.js';
import { mergeMap } from './mergeMap.js';

/**
 * Projects each source value to the same Observable which is merged multiple
 * times in the output Observable.
 *
 * <span class="informal">It's like {@link mergeMap}, but maps each value always
 * to the same inner Observable.</span>
 *
 * ![](mergeMapTo.png)
 *
 * Maps each source value to the given Observable `innerObservable` regardless
 * of the source value, and then merges those resulting Observables into one
 * single Observable, which is the output Observable.
 *
 * ## Example
 *
 * For each click event, start an interval Observable ticking every 1 second
 *
 * ```ts
 * import { fromEvent, mergeMapTo, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(mergeMapTo(interval(1000)));
 *
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link concatMapTo}
 * @see {@link merge}
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeScan}
 * @see {@link switchMapTo}
 *
 * @param innerObservable An `ObservableInput` to replace each value from the
 * source Observable.
 * @param concurrent Maximum number of input Observables being subscribed to
 * concurrently.
 * @return A function that returns an Observable that emits items from the
 * given `innerObservable`.
 * @deprecated Will be removed in v9. Use {@link mergeMap} instead: `mergeMap(() => result)`
 */
export function mergeMapTo<O extends ObservableInput<unknown>>(
  innerObservable: O,
  concurrent?: number
): OperatorFunction<unknown, ObservedValueOf<O>> {
  return mergeMap(() => innerObservable, concurrent);
}
