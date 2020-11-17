/** @prettier */
import { ObservableInput, ObservableInputTuple, OperatorFunction, MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { concatAll } from './concatAll';
import { internalFromArray } from '../observable/fromArray';
import { popScheduler } from '../util/args';

/**
 * Emits all of the values from the source observable, then, once it completes, subscribes
 * to each observable source provided, one at a time, emitting all of their values, and not subscribing
 * to the next one until it completes.
 *
 * `concat(a$, b$, c$)` is the same as `a$.pipe(concatWith(b$, c$))`.
 *
 * ## Example
 *
 * Listen for one mouse click, then listen for all mouse moves.
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { concatWith } from 'rxjs/operators';
 *
 * const clicks$ = fromEvent(document, 'click');
 * const moves$ = fromEvent(document, 'mousemove');
 *
 * clicks$.pipe(
 *   map(() => 'click'),
 *   take(1),
 *   concatWith(
 *     moves$.pipe(
 *       map(() => 'move')
 *     )
 *   )
 * )
 * .subscribe(x => console.log(x));
 *
 * // 'click'
 * // 'move'
 * // 'move'
 * // 'move'
 * // ...
 * ```
 *
 * @param otherSources Other observable sources to subscribe to, in sequence, after the original source is complete.
 */
export function concatWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]> {
  return concat(...otherSources);
}

/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T>(scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2>(v2: ObservableInput<T2>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2, T3>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  scheduler?: SchedulerLike
): OperatorFunction<T, T | T2 | T3>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2, T3, T4>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  scheduler?: SchedulerLike
): OperatorFunction<T, T | T2 | T3 | T4>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2, T3, T4, T5>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>,
  scheduler?: SchedulerLike
): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2, T3, T4, T5, T6>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>,
  v6: ObservableInput<T6>,
  scheduler?: SchedulerLike
): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T>(...observables: Array<ObservableInput<T> | SchedulerLike>): MonoTypeOperatorFunction<T>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, R>(...observables: Array<ObservableInput<any> | SchedulerLike>): OperatorFunction<T, R>;

/**
 * @deprecated remove in v8. Use {@link concatWith}
 */
export function concat<T, R>(...args: any[]): OperatorFunction<T, R> {
  const scheduler = popScheduler(args);
  return operate((source, subscriber) => {
    concatAll()(internalFromArray([source, ...args], scheduler)).subscribe(subscriber as any);
  });
}
