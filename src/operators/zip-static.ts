import {Observable, ObservableOrPromiseOrIterable} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {ZipOperator} from './zip-support';

export function zip<T>(
  first: ObservableOrPromiseOrIterable<T>): Observable<[T]>;
export function zip<T, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  project: (v1: T) => TResult): Observable<TResult>;
export function zip<T, T2>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>): Observable<[T, T2]>;
export function zip<T, T2, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zip<T, T2, T3>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, T4>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>): Observable<[T, T2, T3, T4]>;
export function zip<T, T2, T3, T4, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
export function zip<T, T2, T3, T4, T5>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;
export function zip<T, T2, T3, T4, T5, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
export function zip<T, T2, T3, T4, T5, T6>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
export function zip<T, T2, T3, T4, T5, T6, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
export function zip<T, T2, T3, T4, T5, T6, T7>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  eventh: ObservableOrPromiseOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
export function zip<T, T2, T3, T4, T5, T6, T7, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  eventh: ObservableOrPromiseOrIterable<T7>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
export function zip<T, T2, T3, T4, T5, T6, T7, T8>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eighth: ObservableOrPromiseOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
export function zip<T, T2, T3, T4, T5, T6, T7, T8, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eighth: ObservableOrPromiseOrIterable<T8>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
export function zip<T, T2, T3, T4, T5, T6, T7, T8, T9>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eighth: ObservableOrPromiseOrIterable<T8>,
  ninth: ObservableOrPromiseOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
export function zip<T, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eighth: ObservableOrPromiseOrIterable<T8>,
  ninth: ObservableOrPromiseOrIterable<T9>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
export function zip<T>(
  ...observables: Array<ObservableOrPromiseOrIterable<T> | ((...values: Array<T>) => T)>): Observable<T>;
export function zip<T, R>(
  ...observables: Array<ObservableOrPromiseOrIterable<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function zip(...observables: Array<ObservableOrPromiseOrIterable<any> | ((...values: Array<any>) => any)>): Observable<any> {
  const project = <((...ys: Array<any>) => any)> observables[observables.length - 1];
  if (typeof project === 'function') {
    observables.pop();
  }
  return new ArrayObservable(observables).lift(new ZipOperator(project));
}
