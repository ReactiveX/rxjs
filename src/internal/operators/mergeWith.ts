/** @prettier */
import { ObservableInput, ObservableInputTuple, OperatorFunction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { internalFromArray } from '../observable/fromArray';
import { mergeAll } from './mergeAll';
import { popNumber, popScheduler } from '../util/args';

/** @deprecated use {@link mergeWith} or static {@link merge} */
export function merge<T, A extends unknown[]>(...args: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
/** @deprecated use {@link mergeWith} or static {@link merge} */
export function merge<T, A extends unknown[]>(...args: [...ObservableInputTuple<A>, number?]): OperatorFunction<T, T | A[number]>;
/** @deprecated use {@link mergeWith} or static {@link merge} */
export function merge<T, A extends unknown[]>(...args: [...ObservableInputTuple<A>, SchedulerLike?]): OperatorFunction<T, T | A[number]>;
/** @deprecated use {@link mergeWith} or static {@link merge} */
export function merge<T, A extends unknown[]>(
  ...args: [...ObservableInputTuple<A>, number?, SchedulerLike?]
): OperatorFunction<T, T | A[number]>;

export function merge<T>(...args: unknown[]): OperatorFunction<T, unknown> {
  const scheduler = popScheduler(args);
  const concurrent = popNumber(args, Infinity);
  args = argsOrArgArray(args);

  return operate((source, subscriber) => {
    mergeAll(concurrent)(internalFromArray([source, ...(args as ObservableInput<T>[])], scheduler)).subscribe(subscriber as any);
  });
}

/**
 * Merge the values from all observables to an single observable result.
 *
 * Creates an observable, that when subscribed to, subscribes to the source
 * observable, and all other sources provided as arguments. All values from
 * every source are emitted from the resulting subscription.
 *
 * When all sources complete, the resulting observable will complete.
 *
 * When any one source errors, the resulting observable will error.
 *
 *
 * ### Example
 *
 * Joining all outputs from multiple user input event streams:
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { map, mergeWith } from 'rxjs/operators';
 *
 * const clicks$ = fromEvent(document, 'click').pipe(map(() => 'click'));
 * const mousemoves$ = fromEvent(document, 'mousemove').pipe(map(() => 'mousemove'));
 * const dblclicks$ = fromEvent(document, 'dblclick').pipe(map(() => 'dblclick'));
 *
 * mousemoves$.pipe(
 *   mergeWith(clicks$, dblclicks$),
 * )
 * .subscribe(x => console.log(x));
 *
 * // result (assuming user interactions)
 * // "mousemove"
 * // "mousemove"
 * // "mousemove"
 * // "click"
 * // "click"
 * // "dblclick"
 * ```
 * @param otherSources the sources to combine the current source with.
 */
export function mergeWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]> {
  return merge(...otherSources);
}
