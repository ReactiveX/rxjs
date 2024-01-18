import { Observable, subscribeToArray, operate } from '@rxjs/observable';
import type { OperatorFunction, ValueFromArray } from '../types.js';

export function startWith<T>(value: null): OperatorFunction<T, T | null>;
export function startWith<T>(value: undefined): OperatorFunction<T, T | undefined>;
export function startWith<T, A extends readonly unknown[] = T[]>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;

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
 * import { timer, map, startWith } from 'rxjs';
 *
 * timer(1000)
 *   .pipe(
 *     map(() => 'timer emit'),
 *     startWith('timer start')
 *   )
 *   .subscribe(x => console.log(x));
 *
 * // results:
 * // 'timer start'
 * // 'timer emit'
 * ```
 *
 * @param values Items you want the modified Observable to emit first.
 * @return A function that returns an Observable that synchronously emits
 * provided values before subscribing to the source Observable.
 *
 * @see {@link endWith}
 * @see {@link finalize}
 * @see {@link concat}
 */
export function startWith<T, D>(...values: D[]): OperatorFunction<T, T | D> {
  return (source) =>
    new Observable((destination) => {
      subscribeToArray(values, operate({ destination, complete: () => source.subscribe(destination) }));
    });
}
