import {  concat as concatStatic } from '../observable/concat';
import { Observable } from '../Observable';
import { ObservableInput, OperatorFunction, MonoTypeOperatorFunction, ISchedulerLike } from '../types';

/* tslint:disable:max-line-length */
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T>(scheduler?: ISchedulerLike): MonoTypeOperatorFunction<T>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2>(v2: ObservableInput<T2>, scheduler?: ISchedulerLike): OperatorFunction<T, T | T2>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: ISchedulerLike): OperatorFunction<T, T | T2 | T3>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: ISchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: ISchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: ISchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T>(...observables: Array<ObservableInput<T> | ISchedulerLike>): MonoTypeOperatorFunction<T>;
/** @deprecated remove in v8. Use {@link concatWith} */
export function concat<T, R>(...observables: Array<ObservableInput<any> | ISchedulerLike>): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * @deprecated remove in v8. Use {@link concatWith}
 */
export function concat<T, R>(...observables: Array<ObservableInput<any> | ISchedulerLike>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift.call(concatStatic(source, ...(observables as any[])));
}
