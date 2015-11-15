import {Observable, ObservableOrPromise, ArrayOrIterator} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {ZipOperator} from './zip-support';

export function zip<T>(
  first: ObservableOrPromise<T>): Observable<[T]>;
export function zip<T>(
  first: ArrayOrIterator<T>): Observable<[T]>;
export function zip<T, TResult>(
  first: ObservableOrPromise<T>,
  project: (v1: T) => TResult): Observable<TResult>;
export function zip<T, TResult>(
  first: ArrayOrIterator<T>,
  project: (v1: T) => TResult): Observable<TResult>;
export function zip<T, T2>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>): Observable<[T, T2]>;
export function zip<T, T2>(
  first: ArrayOrIterator<T>,
  second: ObservableOrPromise<T2> | ArrayOrIterator<T2>): Observable<[T, T2]>;
export function zip<T, T2>(
  first: ObservableOrPromise<T>,
  second: ArrayOrIterator<T2>): Observable<[T, T2]>;
export function zip<T, T2>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>): Observable<[T, T2]>;
export function zip<T, T2, TResult>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zip<T, T2, TResult>(
  first: ObservableOrPromise<T>,
  second: ArrayOrIterator<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zip<T, T2, TResult>(
  first: ArrayOrIterator<T>,
  second: ObservableOrPromise<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zip<T, T2, TResult>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zip<T, T2, T3>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3>(
  first: ArrayOrIterator<T>,
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3>(
  first: ObservableOrPromise<T>,
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3>(
  first: ArrayOrIterator<T>,
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3>(
  first: ObservableOrPromise<T>,
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3, TResult>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, TResult>(
  first: ArrayOrIterator<T>,
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, TResult>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, TResult>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, TResult>(
  first: ObservableOrPromise<T>,
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, TResult>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, TResult>(
  first: ArrayOrIterator<T>,
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, TResult>(
  first: ObservableOrPromise<T>,
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T>(
  ...observables: Array<ObservableOrPromise<T>>): Observable<T[]>;
export function zip<T>(
  ...observables: Array<ArrayOrIterator<T>>): Observable<T[]>;
export function zip<T, R>(
  ...observables: Array<ObservableOrPromise<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function zip<T, R>(
  ...observables: Array<ArrayOrIterator<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function zip(...observables: Array<ObservableOrPromise<any> | ArrayOrIterator<any> | ((...values: Array<any>) => any)>): Observable<any> {
  const project = <((...ys: Array<any>) => any)> observables[observables.length - 1];
  if (typeof project === 'function') {
    observables.pop();
  }
  return new ArrayObservable(observables).lift(new ZipOperator(project));
}
