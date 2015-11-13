import {Observable, ObservableOrPromiseOrIterable} from '../Observable';
import {zip} from './zip-static';

export function zipProto<T, T2>(
    second: ObservableOrPromiseOrIterable<T2>): Observable<[T, T2]>;
export function zipProto<T, T2, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, T4>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>): Observable<[T, T2, T3, T4]>;
export function zipProto<T, T2, T3, T4, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, T4, T5>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;
export function zipProto<T, T2, T3, T4, T5, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, T4, T5, T6>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
export function zipProto<T, T2, T3, T4, T5, T6, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, T4, T5, T6, T7>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    eventh: ObservableOrPromiseOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
export function zipProto<T, T2, T3, T4, T5, T6, T7, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    eventh: ObservableOrPromiseOrIterable<T7>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, T4, T5, T6, T7, T8>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    seventh: ObservableOrPromiseOrIterable<T7>,
    eighth: ObservableOrPromiseOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
export function zipProto<T, T2, T3, T4, T5, T6, T7, T8, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    seventh: ObservableOrPromiseOrIterable<T7>,
    eighth: ObservableOrPromiseOrIterable<T8>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, T4, T5, T6, T7, T8, T9>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    seventh: ObservableOrPromiseOrIterable<T7>,
    eighth: ObservableOrPromiseOrIterable<T8>,
    ninth: ObservableOrPromiseOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
export function zipProto<T, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    seventh: ObservableOrPromiseOrIterable<T7>,
    eighth: ObservableOrPromiseOrIterable<T8>,
    ninth: ObservableOrPromiseOrIterable<T9>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
export function zipProto<T, A, R>(
    ...observables: Array<ObservableOrPromiseOrIterable<A> | ((...values: Array<T | A>) => R)>): Observable<R>;
export function zipProto<T>(): Observable<[T]>;
export function zipProto<R>(...observables: Array<ObservableOrPromiseOrIterable<any> | ((...values: Array<any>) => R)>): Observable<R> {
  observables.unshift(this);
  return zip.apply(this, observables);
}
