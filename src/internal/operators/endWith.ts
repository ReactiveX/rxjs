import { Observable } from '../Observable';
import { concat } from '../observable/concat';
import { of } from '../observable/of';
import { MonoTypeOperatorFunction, SchedulerLike, OperatorFunction, ValueFromArray } from '../types';

/* tslint:disable:max-line-length */
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([source, [a, b, c]], scheduler).pipe(concatAll())`) */
export function endWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([source, [a, b, c]], scheduler).pipe(concatAll())`) */
export function endWith<T, A>(v1: A, scheduler: SchedulerLike): OperatorFunction<T, T | A>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([source, [a, b, c]], scheduler).pipe(concatAll())`) */
export function endWith<T, A, B>(v1: A, v2: B, scheduler: SchedulerLike): OperatorFunction<T, T | A | B>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([source, [a, b, c]], scheduler).pipe(concatAll())`) */
export function endWith<T, A, B, C>(v1: A, v2: B, v3: C, scheduler: SchedulerLike): OperatorFunction<T, T | A | B | C>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([source, [a, b, c]], scheduler).pipe(concatAll())`) */
export function endWith<T, A, B, C, D>(v1: A, v2: B, v3: C, v4: D, scheduler: SchedulerLike): OperatorFunction<T, T | A | B | C | D>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([source, [a, b, c]], scheduler).pipe(concatAll())`) */
export function endWith<T, A, B, C, D, E>(v1: A, v2: B, v3: C, v4: D, v5: E, scheduler: SchedulerLike): OperatorFunction<T, T | A | B | C | D | E>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([source, [a, b, c]], scheduler).pipe(concatAll())`) */
export function endWith<T, A, B, C, D, E, F>(v1: A, v2: B, v3: C, v4: D, v5: E, v6: F, scheduler: SchedulerLike): OperatorFunction<T, T | A | B | C | D | E | F>;

export function endWith<T, A extends any[]>(...args: A): OperatorFunction<T, T | ValueFromArray<A>>;

/* tslint:enable:max-line-length */

/**
 * Returns an observable that will emit all values from the source, then synchronously emit
 * he provided value(s) immediately after the source completes.
 *
 * NOTE: Passing a last argument of a Scheduler is _deprecated_, and may result in incorrect
 * types in TypeScript.
 *
 * This is useful for knowing when an observable ends. Particularly when paired with an
 * operator like {@link takeUntil}
 *
 * ![](endWith.png)
 *
 * ## Example
 *
 * Emit values to know when an interval starts and stops. The interval will
 * stop when a user clicks anywhere on the document.
 *
 * ```ts
 * import { interval, fromEvent } from 'rxjs';
 * import { map, startWith, takeUntil, endWith } from 'rxjs/operators';
 *
 * const ticker$ = interval(5000).pipe(
 *   map(() => 'tick'),
 * );
 *
 * const documentClicks$ = fromEvent(document, 'click');
 *
 * ticker$.pipe(
 *   startWith('interval started'),
 *   takeUntil(documentClicks$),
 *   endWith('interval ended by click'),
 * )
 * .subscribe(
 *   x = console.log(x);
 * )
 *
 * // Result (assuming a user clicks after 15 seconds)
 * // "interval started"
 * // "tick"
 * // "tick"
 * // "tick"
 * // "interval ended by click"
 * ```
 *
 * @param values - Items you want the modified Observable to emit last.
 *
 * @see startWith
 * @see concat
 * @see takeUntil
 */
export function endWith<T>(...values: Array<T | SchedulerLike>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => concat(source, of(...values)) as Observable<T>;
}
