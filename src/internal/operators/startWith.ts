import { Observable } from '../Observable';
import { concat } from '../observable/concat';
import { isScheduler } from '../util/isScheduler';
import { MonoTypeOperatorFunction, OperatorFunction, SchedulerLike, ValueFromArray } from '../types';

/* tslint:disable:max-line-length */
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([[a, b, c], source], scheduler).pipe(concatAll())`) */
export function startWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([[a, b, c], source], scheduler).pipe(concatAll())`) */
export function startWith<T, D>(v1: D, scheduler: SchedulerLike): OperatorFunction<T, T | D>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([[a, b, c], source], scheduler).pipe(concatAll())`) */
export function startWith<T, D, E>(v1: D, v2: E, scheduler: SchedulerLike): OperatorFunction<T, T | D | E>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([[a, b, c], source], scheduler).pipe(concatAll())`) */
export function startWith<T, D, E, F>(v1: D, v2: E, v3: F, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([[a, b, c], source], scheduler).pipe(concatAll())`) */
export function startWith<T, D, E, F, G>(v1: D, v2:  E, v3: F, v4: G, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F | G>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([[a, b, c], source], scheduler).pipe(concatAll())`) */
export function startWith<T, D, E, F, G, H>(v1: D, v2: E, v3: F, v4: G, v5: H, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F | G | H>;
/** @deprecated use {@link scheduled} and {@link concatAll} (e.g. `scheduled([[a, b, c], source], scheduler).pipe(concatAll())`) */
export function startWith<T, D, E, F, G, H, I>(v1: D, v2: E, v3: F, v4: G, v5: H, v6: I, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F | G | H | I>;

export function startWith<T, A extends any[] = T[]>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;

/**
 * Returns an observable that, at the moment of subscription, will synchronously emit all
 * values provided to this operator, then subscribe to the source and mirror all of its emissions
 * to subscribers.
 *
 * This is a useful way to know when subscription has occurred on an existing observable.
 *
 * <span class="informal">First emits its arguments in order, and then any
 * emissions from the source.</span>
 *
 * ![](startWith.png)
 *
 * ## Examples
 *
 * Emit a value when a timer starts.
 *
 * ```ts
 * import { timer } from 'rxjs';
 * import { startWith, map } from 'rxjs/operators';
 *
 * timer(1000)
 *   .pipe(
 *     map(() => 'timer emit'),
 *     startWith('timer start')
 *   )
 *   .subscribe(x => console.log(x));
 *
 * // results:
 * // "timer start"
 * // "timer emit"
 * ```
 *
 * @param values Items you want the modified Observable to emit first.
 *
 * @see endWith
 * @see finalize
 * @see concat
 */
export function startWith<T, D>(...values: D[]): OperatorFunction<T, T | D> {
  const scheduler = values[values.length - 1];
  if (isScheduler(scheduler)) {
    // deprecated path
    values.pop();
    return (source: Observable<T>) => concat(values, source, scheduler);
  } else {
    return (source: Observable<T>) => concat(values, source);
  }
}
