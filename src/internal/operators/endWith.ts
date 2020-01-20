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
 * Returns an observable that will synchronously emit the provided value(s) after the
 * source completes. NOTE: Passing a last argument of a Scheduler is _deprecated_, and will
 * result in incorrect types in TypeScript.
 *
 * ![](endWith.png)
 *
 * ## Example
 * ### After the source observable completes, appends an emission and then completes too.
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { endWith } from 'rxjs/operators';
 *
 * of('hi', 'how are you?', 'sorry, I have to go now').pipe(
 *   endWith('goodbye!'),
 * )
 * .subscribe(word => console.log(word));
 * // result:
 * // 'hi'
 * // 'how are you?'
 * // 'sorry, I have to go now'
 * // 'goodbye!'
 * ```
 *
 * @param values - Items you want the modified Observable to emit last.
 */
export function endWith<T>(...values: Array<T | SchedulerLike>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => concat(source, of(...values)) as Observable<T>;
}
