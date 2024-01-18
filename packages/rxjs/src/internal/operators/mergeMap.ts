import type { ObservableInput, OperatorFunction, ObservedValueOf } from '../types.js';
import { Observable } from '@rxjs/observable';
import { mergeInternals } from './mergeInternals.js';

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link mergeAll}.</span>
 *
 * ![](mergeMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger.
 *
 * ## Example
 *
 * Map and flatten each letter to an Observable ticking every 1 second
 *
 * ```ts
 * import { of, mergeMap, interval, map } from 'rxjs';
 *
 * const letters = of('a', 'b', 'c');
 * const result = letters.pipe(
 *   mergeMap(x => interval(1000).pipe(map(i => x + i)))
 * );
 *
 * result.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // a0
 * // b0
 * // c0
 * // a1
 * // b1
 * // c1
 * // continues to list a, b, c every second with respective ascending integers
 * ```
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link merge}
 * @see {@link mergeAll}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link switchMap}
 *
 * @param project A function that, when applied to an item emitted by the source
 * Observable, returns an Observable.
 * @param concurrent Maximum number of `ObservableInput`s being subscribed to concurrently.
 * @return A function that returns an Observable that emits the result of
 * applying the projection function to each item emitted by the source Observable
 * and merging the results of the Observables obtained from this transformation.
 */
export function mergeMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  concurrent: number = Infinity
): OperatorFunction<T, ObservedValueOf<O>> {
  return (source) => new Observable((subscriber) => mergeInternals(source, subscriber, project, concurrent));
}
