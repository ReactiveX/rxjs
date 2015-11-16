import {Observable, ObservableOrPromise, ArrayOrIterator} from '../Observable';
import {zip} from './zip-static';

export function zipProto<T, TResult>(
  project: (v1: T) => TResult): Observable<TResult>;
export function zipProto<T, TResult>(
  project: (v1: T) => TResult): Observable<TResult>;
export function zipProto<T, T2>(
  second: ObservableOrPromise<T2>): Observable<[T, T2]>;
export function zipProto<T, T2>(
  second: ObservableOrPromise<T2> | ArrayOrIterator<T2>): Observable<[T, T2]>;
export function zipProto<T, T2>(
  second: ArrayOrIterator<T2>): Observable<[T, T2]>;
export function zipProto<T, T2>(
  second: ArrayOrIterator<T2>): Observable<[T, T2]>;
export function zipProto<T, T2, TResult>(
  second: ObservableOrPromise<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zipProto<T, T2, TResult>(
  second: ArrayOrIterator<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zipProto<T, T2, TResult>(
  second: ObservableOrPromise<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zipProto<T, T2, TResult>(
  second: ArrayOrIterator<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3>(
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3>(
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3>(
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3>(
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3>(
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3>(
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3>(
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3>(
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
export function zipProto<T, T2, T3, TResult>(
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, TResult>(
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, TResult>(
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, TResult>(
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, TResult>(
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, TResult>(
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, TResult>(
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T, T2, T3, TResult>(
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zipProto<T>(
  ...observables: Array<ObservableOrPromise<T>>): Observable<T[]>;
export function zipProto<T>(
  ...observables: Array<ArrayOrIterator<T>>): Observable<T[]>;
export function zipProto<T, R>(
  ...observables: Array<ObservableOrPromise<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function zipProto<T, R>(
  ...observables: Array<ArrayOrIterator<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function zipProto<T>(): Observable<[T]>;
export function zipProto<R>(...observables: Array<ObservableOrPromise<any> | ArrayOrIterator<any> | ((...values: Array<any>) => R)>): Observable<R> {
  observables.unshift(this);
  return zip.apply(this, observables);
}
