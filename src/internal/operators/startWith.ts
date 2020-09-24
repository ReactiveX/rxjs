/** @prettier */
import { concat } from '../observable/concat';
import { MonoTypeOperatorFunction, OperatorFunction, SchedulerLike, ValueFromArray } from '../types';
import { popScheduler } from '../util/args';
import { operate } from '../util/lift';

/* tslint:disable:max-line-length */
/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function startWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function startWith<T, D>(v1: D, scheduler: SchedulerLike): OperatorFunction<T, T | D>;
/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function startWith<T, D, E>(v1: D, v2: E, scheduler: SchedulerLike): OperatorFunction<T, T | D | E>;
/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function startWith<T, D, E, F>(v1: D, v2: E, v3: F, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F>;
/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function startWith<T, D, E, F, G>(v1: D, v2: E, v3: F, v4: G, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F | G>;
/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function startWith<T, D, E, F, G, H>(
  v1: D,
  v2: E,
  v3: F,
  v4: G,
  v5: H,
  scheduler: SchedulerLike
): OperatorFunction<T, T | D | E | F | G | H>;
/** @deprecated The scheduler argument is deprecated, use scheduled and concatAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function startWith<T, D, E, F, G, H, I>(
  v1: D,
  v2: E,
  v3: F,
  v4: G,
  v5: H,
  v6: I,
  scheduler: SchedulerLike
): OperatorFunction<T, T | D | E | F | G | H | I>;

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
  const scheduler = popScheduler(values);
  return operate((source, subscriber) => {
    // Here we can't pass `undefined` as a scheduler, becuase if we did, the
    // code inside of `concat` would be confused by the `undefined`, and treat it
    // like an invalid observable. So we have to split it two different ways.
    (scheduler ? concat(values, source, scheduler) : concat(values, source)).subscribe(subscriber);
  });
}
