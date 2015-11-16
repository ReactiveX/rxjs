import {Observable, ObservableOrPromise, ArrayOrIterator} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {CombineLatestOperator} from './combineLatest-support';

/**
 * Combines the values from this observable with values from observables passed as arguments. This is done by subscribing
 * to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
 * emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
 * value of that, or just emitting the array of recent values directly if there is no `project` function.
 * @param {...Observable} observables the observables to combine the source with
 * @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
 * @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
 * the most recent values from each observable.
 */
export function combineLatest<T, TResult>(
  project: (v1: T) => TResult
): Observable<TResult>;
export function combineLatest<T, TResult>(
  project: (v1: T) => TResult
): Observable<TResult>;
export function combineLatest<T, T2>(
  second: ObservableOrPromise<T2>
): Observable<[T, T2]>;
export function combineLatest<T, T2>(
  second: ObservableOrPromise<T2> | ArrayOrIterator<T2>
): Observable<[T, T2]>;
export function combineLatest<T, T2>(
  second: ArrayOrIterator<T2>
): Observable<[T, T2]>;
export function combineLatest<T, T2>(
  second: ArrayOrIterator<T2>
): Observable<[T, T2]>;
export function combineLatest<T, T2, TResult>(
  second: ObservableOrPromise<T2>,
  project: (v1: T, v2: T2) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, TResult>(
  second: ArrayOrIterator<T2>,
  project: (v1: T, v2: T2) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, TResult>(
  second: ObservableOrPromise<T2>,
  project: (v1: T, v2: T2) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, TResult>(
  second: ArrayOrIterator<T2>,
  project: (v1: T, v2: T2) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, T3>(
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>
): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3>(
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>
): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3>(
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>
): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3>(
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>
): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3>(
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>
): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3>(
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>
): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3>(
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>
): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3>(
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>
): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, TResult>(
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, T3, TResult>(
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, T3, TResult>(
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, T3, TResult>(
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, T3, TResult>(
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, T3, TResult>(
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, T3, TResult>(
  second: ObservableOrPromise<T2>,
  third: ArrayOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult
): Observable<TResult>;
export function combineLatest<T, T2, T3, TResult>(
  second: ArrayOrIterator<T2>,
  third: ObservableOrPromise<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult
): Observable<TResult>;
export function combineLatest<T>(
  ...observables: Array<ObservableOrPromise<T>>): Observable<T[]>;
export function combineLatest<T>(
  ...observables: Array<ArrayOrIterator<T>>): Observable<T[]>;
export function combineLatest<T, R>(
  ...observables: Array<ObservableOrPromise<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function combineLatest<T, R>(
  ...observables: Array<ArrayOrIterator<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function combineLatest(
  ...observables: Array<ObservableOrPromise<any> | ArrayOrIterator<any> | ((...values: Array<any>) => any)>): Observable<any> {
  observables.unshift(this);
  let project;
  if (typeof observables[observables.length - 1] === 'function') {
    project = observables.pop();
  }
  return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}
