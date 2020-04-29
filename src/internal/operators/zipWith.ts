import { zip as zipStatic } from '../observable/zip';
import { Observable } from '../Observable';
import { ObservableInput, OperatorFunction, ObservedValueTupleFromArray, Cons } from '../types';

/* tslint:disable:max-line-length */
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): OperatorFunction<T, R> ;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, [T, T2, T3, T4]>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, [T, T2, T3, T4, T5]>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, [T, T2, T3, T4, T5, T6]> ;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, R>(array: Array<ObservableInput<T>>): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link zipWith} */
export function zip<T, TOther, R>(array: Array<ObservableInput<TOther>>, project: (v1: T, ...values: Array<TOther>) => R): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * @deprecated Deprecated. Use {@link zipWith}.
 */
export function zip<T, R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): OperatorFunction<T, R> {
  return function zipOperatorFunction(source: Observable<T>) {
    return source.lift.call(
      zipStatic<R>(source, ...observables),
      undefined
    ) as Observable<R>;
  };
}

/**
 * Subscribes to the source, and the observable inputs provided as arguments, and combines their values, by index, into arrays.
 *
 * What is meant by "combine by index": The first value from each will be made into a single array, then emitted,
 * then the second value from each will be combined into a single array and emitted, then the third value
 * from each will be combined into a single array and emitted, and so on.
 *
 * This will continue until it is no longer able to combine values of the same index into an array.
 *
 * After the last value from any one completed source is emitted in an array, the resulting observable will complete,
 * as there is no way to continue "zipping" values together by index.
 *
 * Use-cases for this operator are limited. There are memory concerns if one of the streams is emitting
 * values at a much faster rate than the others. Usage should likely be limited to streams that emit
 * at a similar pace, or finite streams of known length.
 *
 * In many cases, authors want `combineLatestWith` and not `zipWith`.
 *
 * @param otherInputs other observable inputs to collate values from.
 */
export function zipWith<T, A extends ObservableInput<any>[]>(
  ...otherInputs: A
): OperatorFunction<T, Cons<T, ObservedValueTupleFromArray<A>>> {
  return zip(...otherInputs);
}
