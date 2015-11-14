import {Observable, ObservableOrPromiseOrIterator} from '../Observable';
import {zip} from './zip-static';

export function zipProto<T, T2>(
    second: ObservableOrPromiseOrIterator<T2>): Observable<[T, T2]>;
export function zipProto<T, T2, TResult>(
    second: ObservableOrPromiseOrIterator<T2>,
    project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3>(
    second: ObservableOrPromiseOrIterator<T2>,
    third: ObservableOrPromiseOrIterator<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3, TResult>(
    second: ObservableOrPromiseOrIterator<T2>,
    third: ObservableOrPromiseOrIterator<T3>,
    project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, T4>(
    second: ObservableOrPromiseOrIterator<T2>,
    third: ObservableOrPromiseOrIterator<T3>,
    fourth: ObservableOrPromiseOrIterator<T4>): Observable<[T, T2, T3, T4]>;
export function zipProto<T, A, R>(
    ...observables: Array<ObservableOrPromiseOrIterator<A> | ((...values: Array<T | A>) => R)>): Observable<R>;
export function zipProto<T>(): Observable<[T]>;
export function zipProto<R>(...observables: Array<ObservableOrPromiseOrIterator<any> | ((...values: Array<any>) => R)>): Observable<R> {
  observables.unshift(this);
  return zip.apply(this, observables);
}
