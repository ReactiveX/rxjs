import { switchMap } from './switchMap.js';
import type { ObservableInput, OperatorFunction, ObservedValueOf } from '../types.js';

/**
 * Projects each source value to the same Observable which is flattened multiple
 * times with {@link switchMap} in the output Observable.
 *
 * <span class="informal">It's like {@link switchMap}, but maps each value
 * always to the same inner Observable.</span>
 *
 * ![](switchMapTo.png)
 *
 * Maps each source value to the given Observable `innerObservable` regardless
 * of the source value, and then flattens those resulting Observables into one
 * single Observable, which is the output Observable. The output Observables
 * emits values only from the most recently emitted instance of
 * `innerObservable`.
 *
 * ## Example
 *
 * Restart an interval Observable on every click event
 *
 * ```ts
 * import { fromEvent, switchMapTo, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(switchMapTo(interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link concatMapTo}
 * @see {@link switchAll}
 * @see {@link switchMap}
 * @see {@link mergeMapTo}
 *
 * @param innerObservable An `ObservableInput` to replace each value from the
 * source Observable.
 * @return A function that returns an Observable that emits items from the
 * given `innerObservable` every time a value is emitted on the source Observable,
 * and taking only the values from the most recently projected inner Observable.
 * @deprecated Will be removed in v9. Use {@link switchMap} instead: `switchMap(() => result)`
 */
export function switchMapTo<O extends ObservableInput<unknown>>(innerObservable: O): OperatorFunction<unknown, ObservedValueOf<O>> {
  return switchMap(() => innerObservable);
}
