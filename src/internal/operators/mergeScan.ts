/** @prettier */
import { ObservableInput, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { mergeInternals } from './mergeInternals';

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, then each intermediate
 * Observable returned is merged into the output Observable.
 *
 * <span class="informal">It's like {@link scan}, but the Observables returned
 * by the accumulator are merged into the outer Observable.</span>
 *
 * ## Example
 * Count the number of click events
 * ```ts
 * import { fromEvent, of } from 'rxjs';
 * import { mapTo, mergeScan } from 'rxjs/operators';
 *
 * const click$ = fromEvent(document, 'click');
 * const one$ = click$.pipe(mapTo(1));
 * const seed = 0;
 * const count$ = one$.pipe(
 *   mergeScan((acc, one) => of(acc + one), seed),
 * );
 * count$.subscribe(x => console.log(x));
 *
 * // Results:
 * // 1
 * // 2
 * // 3
 * // 4
 * // ...and so on for each click
 * ```
 *
 * @see {@link scan}
 * @see {@link switchScan}
 *
 * @param {function(acc: R, value: T): Observable<R>} accumulator
 * The accumulator function called on each source value.
 * @param seed The initial accumulation value.
 * @param {number} [concurrent=Infinity] Maximum number of
 * input Observables being subscribed to concurrently.
 * @return {Observable<R>} An observable of the accumulated values.
 */
export function mergeScan<T, R>(
  accumulator: (acc: R, value: T, index: number) => ObservableInput<R>,
  seed: R,
  concurrent = Infinity
): OperatorFunction<T, R> {
  return operate((source, subscriber) => {
    // The accumulated state.
    let state = seed;

    return mergeInternals(
      source,
      subscriber,
      (value, index) => accumulator(state, value, index),
      concurrent,
      (value) => {
        state = value;
      },
      false,
      undefined,
      () => (state = null!)
    );
  });
}
