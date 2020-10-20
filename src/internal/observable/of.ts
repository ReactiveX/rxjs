/** @prettier */
import { SchedulerLike, ValueFromArray } from '../types';
import { internalFromArray } from './fromArray';
import { Observable } from '../Observable';
import { scheduleArray } from '../scheduled/scheduleArray';
import { popScheduler } from '../util/args';

/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of(scheduler: SchedulerLike): Observable<never>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T>(a: T, scheduler: SchedulerLike): Observable<T>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T, T2>(a: T, b: T2, scheduler: SchedulerLike): Observable<T | T2>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T, T2, T3>(a: T, b: T2, c: T3, scheduler: SchedulerLike): Observable<T | T2 | T3>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T, T2, T3, T4>(a: T, b: T2, c: T3, d: T4, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T, T2, T3, T4, T5>(a: T, b: T2, c: T3, d: T4, e: T5, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T, T2, T3, T4, T5, T6>(
  a: T,
  b: T2,
  c: T3,
  d: T4,
  e: T5,
  f: T6,
  scheduler: SchedulerLike
): Observable<T | T2 | T3 | T4 | T5 | T6>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T, T2, T3, T4, T5, T6, T7>(
  a: T,
  b: T2,
  c: T3,
  d: T4,
  e: T5,
  f: T6,
  g: T7,
  scheduler: SchedulerLike
): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T, T2, T3, T4, T5, T6, T7, T8>(
  a: T,
  b: T2,
  c: T3,
  d: T4,
  e: T5,
  f: T6,
  g: T7,
  h: T8,
  scheduler: SchedulerLike
): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function of<T, T2, T3, T4, T5, T6, T7, T8, T9>(
  a: T,
  b: T2,
  c: T3,
  d: T4,
  e: T5,
  f: T6,
  g: T7,
  h: T8,
  i: T9,
  scheduler: SchedulerLike
): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;

export function of(): Observable<never>;
/** @deprecated remove in v8. Do not use generic arguments directly, allow inference or cast with `as` */
export function of<T>(): Observable<T>;
export function of<T>(value: T): Observable<T>;
export function of<A extends readonly unknown[]>(...args: A): Observable<ValueFromArray<A>>;

/**
 * Converts the arguments to an observable sequence.
 *
 * <span class="informal">Each argument becomes a `next` notification.</span>
 *
 * ![](of.png)
 *
 * Unlike {@link from}, it does not do any flattening and emits each argument in whole
 * as a separate `next` notification.
 *
 * ## Examples
 *
 * Emit the values `10, 20, 30`
 *
 * ```ts
 * import { of } from 'rxjs';
 *
 * of(10, 20, 30)
 * .subscribe(
 *   next => console.log('next:', next),
 *   err => console.log('error:', err),
 *   () => console.log('the end'),
 * );
 *
 * // Outputs
 * // next: 10
 * // next: 20
 * // next: 30
 * // the end
 * ```
 *
 * Emit the array `[1, 2, 3]`
 *
 * ```ts
 * import { of } from 'rxjs';
 *
 * of([1, 2, 3])
 * .subscribe(
 *   next => console.log('next:', next),
 *   err => console.log('error:', err),
 *   () => console.log('the end'),
 * );
 *
 * // Outputs
 * // next: [1, 2, 3]
 * // the end
 * ```
 *
 * @see {@link from}
 * @see {@link range}
 *
 * @param {...T} values A comma separated list of arguments you want to be emitted
 * @return {Observable} An Observable that emits the arguments
 * described above and then completes.
 */
export function of<T>(...args: Array<T | SchedulerLike>): Observable<T> {
  const scheduler = popScheduler(args);
  return scheduler ? scheduleArray(args as T[], scheduler) : internalFromArray(args as T[]);
}
