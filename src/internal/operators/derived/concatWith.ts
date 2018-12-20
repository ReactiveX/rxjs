import { concat } from 'rxjs/internal/create/concat';
import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction, ObservableInput } from 'rxjs/internal/types';

/* tslint:disable:max-line-length */
/** @deprecated Deprecated in favor of static concat. */
export function concatWith<T>(): OperatorFunction<T, T>;
/** @deprecated Deprecated in favor of static concat. */
export function concatWith<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, T | T2>;
/** @deprecated Deprecated in favor of static concat. */
export function concatWith<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, T | T2 | T3>;
/** @deprecated Deprecated in favor of static concat. */
export function concatWith<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, T | T2 | T3 | T4>;
/** @deprecated Deprecated in favor of static concat. */
export function concatWith<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
/** @deprecated Deprecated in favor of static concat. */
export function concatWith<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
/** @deprecated Deprecated in favor of static concat. */
export function concatWith<T>(...observables: Array<ObservableInput<T>>): OperatorFunction<T, T>;
/** @deprecated Deprecated in favor of static concat. */
export function concatWith<T, R>(...observables: Array<ObservableInput<any>>): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */
export function concatWith<T>(...otherSources: ObservableInput<any>[]): OperatorFunction<T, T|any> {
  return (source: Observable<T>) => concat(source, ...otherSources);
}
