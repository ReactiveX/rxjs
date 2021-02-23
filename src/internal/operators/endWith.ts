/** prettier */
import { Observable } from '../Observable.js';
import { concat } from '../observable/concat.js';
import { of } from '../observable/of.js';
import { MonoTypeOperatorFunction, SchedulerLike, OperatorFunction, ValueFromArray } from '../types';

/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function endWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function endWith<T, A extends unknown[] = T[]>(...args: [...A, SchedulerLike]): OperatorFunction<T, T | ValueFromArray<A>>;

export function endWith<T, A extends unknown[] = T[]>(...args: A): OperatorFunction<T, T | ValueFromArray<A>>;

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
 * @param values Items you want the modified Observable to emit last.
 * @return A function that returns an Observable that emits all values from the
 * source, then synchronously emits the provided value(s) immediately after the
 * source completes.
 *
 * @see {@link startWith}
 * @see {@link concat}
 * @see {@link takeUntil}
 */
export function endWith<T>(...values: Array<T | SchedulerLike>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => concat(source, of(...values)) as Observable<T>;
}
