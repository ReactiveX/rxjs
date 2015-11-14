import {Observable, ObservableOrPromiseOrIterator} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {ZipOperator} from './zip-support';

export function zip<T>(
  first: ObservableOrPromiseOrIterator<T>): Observable<[T]>;
export function zip<T, TResult>(
  first: ObservableOrPromiseOrIterator<T>,
  project: (v1: T) => TResult): Observable<TResult>;
export function zip<T, T2>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>): Observable<[T, T2]>;
export function zip<T, T2, TResult>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function zip<T, T2, T3>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  third: ObservableOrPromiseOrIterator<T3>): Observable<[T, T2, T3]>;
export function zip<T, T2, T3, TResult>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  third: ObservableOrPromiseOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function zip<T, T2, T3, T4>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  third: ObservableOrPromiseOrIterator<T3>,
  fourth: ObservableOrPromiseOrIterator<T4>): Observable<[T, T2, T3, T4]>;
export function zip<T>(
  ...observables: Array<ObservableOrPromiseOrIterator<T> | ((...values: Array<T>) => T)>): Observable<T>;
export function zip<T, R>(
  ...observables: Array<ObservableOrPromiseOrIterator<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function zip(...observables: Array<ObservableOrPromiseOrIterator<any> | ((...values: Array<any>) => any)>): Observable<any> {
  const project = <((...ys: Array<any>) => any)> observables[observables.length - 1];
  if (typeof project === 'function') {
    observables.pop();
  }
  return new ArrayObservable(observables).lift(new ZipOperator(project));
}
