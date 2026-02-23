import type { OperatorFunction, ObservableInput } from '../types.js';
import { zip } from '../observable/zip.js';
import { joinAllInternals } from './joinAllInternals.js';

/**
 * Collects all observable inner sources from the source, once the source completes,
 * it will subscribe to all inner sources, combining their values by index and emitting
 * them.
 *
 * <span class="informal">Waits for an outer Observable to complete, then zips
 * together each inner Observable's values by index into an array.</span>
 *
 * ![](zipAll.png)
 *
 * `zipAll` subscribes to a higher-order Observable (an Observable of Observables). Once the
 * outer Observable completes, it subscribes to all collected inner Observables and emits
 * arrays of values, where the _n_-th array contains the _n_-th value from each inner Observable.
 * The resulting Observable completes when the shortest inner Observable completes.
 *
 * ## Examples
 *
 * ### Map to inner Observables and zip them together
 *
 * ```ts
 * import { of, zipAll } from 'rxjs';
 *
 * const obs1 = of(1, 2, 3);
 * const obs2 = of('a', 'b', 'c');
 *
 * of(obs1, obs2).pipe(
 *   zipAll()
 * ).subscribe(console.log);
 *
 * // [1, 'a']
 * // [2, 'b']
 * // [3, 'c']
 * ```
 *
 * ### Use a project function to combine values
 *
 * ```ts
 * import { of, zipAll } from 'rxjs';
 *
 * const obs1 = of(1, 2, 3);
 * const obs2 = of('a', 'b', 'c');
 *
 * of(obs1, obs2).pipe(
 *   zipAll((num, str) => `${num}-${str}`)
 * ).subscribe(console.log);
 *
 * // '1-a'
 * // '2-b'
 * // '3-c'
 * ```
 *
 * @see {@link zipWith}
 * @see {@link zip}
 * @see {@link combineLatestAll}
 */
export function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export function zipAll<T>(): OperatorFunction<any, T[]>;
export function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export function zipAll<T, R>(project?: (...values: T[]) => R) {
  return joinAllInternals(zip, project);
}
