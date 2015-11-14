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
export function zipProto<T, A, R>(
    ...observables: Array<ObservableOrPromiseOrIterable<A> | ((...values: Array<T | A>) => R)>): Observable<R>;
export function zipProto<T>(): Observable<[T]>;
export function zipProto<R>(...observables: Array<ObservableOrPromiseOrIterable<any> | ((...values: Array<any>) => R)>): Observable<R> {
  observables.unshift(this);
  return zip.apply(this, observables);
}
