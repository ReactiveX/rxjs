import { combineLatestInit } from '../observable/combineLatest';
import { ObservableInput, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { pipe } from '../util/pipe';
import { popResultSelector } from '../util/args';

/* tslint:disable:max-line-length */
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, R>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  project: (v1: T, v2: T2, v3: T3) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, R>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  project: (v1: T, v2: T2, v3: T3, v4: T4) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, T5, R>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, T5, T6, R>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>,
  v6: ObservableInput<T6>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>
): OperatorFunction<T, [T, T2, T3, T4]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, T5>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>
): OperatorFunction<T, [T, T2, T3, T4, T5]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, T5, T6>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>,
  v6: ObservableInput<T6>
): OperatorFunction<T, [T, T2, T3, T4, T5, T6]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, R>(array: ObservableInput<T>[]): OperatorFunction<T, Array<T>>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, TOther, R>(
  array: ObservableInput<TOther>[],
  project: (v1: T, ...values: Array<TOther>) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

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
