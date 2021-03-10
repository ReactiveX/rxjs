import { combineLatestInit } from '../observable/combineLatest';
import { ObservableInput, ObservableInputTuple, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { pipe } from '../util/pipe';
import { popResultSelector } from '../util/args';

/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, A extends readonly unknown[], R>(
  sources: [...ObservableInputTuple<A>],
  project: (...values: [T, ...A]) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, A extends readonly unknown[], R>(sources: [...ObservableInputTuple<A>]): OperatorFunction<T, [T, ...A]>;

/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, A extends readonly unknown[], R>(
  ...sourcesAndProject: [...ObservableInputTuple<A>, (...values: [T, ...A]) => R]
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, A extends readonly unknown[], R>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, [T, ...A]>;

/**
 * @deprecated Deprecated, use {@link combineLatestWith} or static {@link combineLatest}
 */
export function combineLatest<T, R>(...args: (ObservableInput<any> | ((...values: any[]) => R))[]): OperatorFunction<T, unknown> {
  const resultSelector = popResultSelector(args);
  return resultSelector
    ? pipe(combineLatest(...args), mapOneOrManyArgs(resultSelector))
    : operate((source, subscriber) => {
        combineLatestInit([source, ...argsOrArgArray(args)])(subscriber);
      });
}
