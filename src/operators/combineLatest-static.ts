import {Observable, ObservableOrPromiseOrIterator} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {CombineLatestOperator} from './combineLatest-support';
import {Scheduler} from '../Scheduler';
import {isScheduler} from '../util/isScheduler';

/**
 * Combines the values from observables passed as arguments. This is done by subscribing
 * to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
 * emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
 * value of that, or just emitting the array of recent values directly if there is no `project` function.
 * @param {...Observable} observables the observables to combine
 * @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
 * @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
 * the most recent values from each observable.
 */
export function combineLatest<T>(
  first: ObservableOrPromiseOrIterator<T>,
  scheduler?: Scheduler): Observable<[T]>;
export function combineLatest<T, TResult>(
  first: ObservableOrPromiseOrIterator<T>,
  project: (v1: T) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  scheduler?: Scheduler): Observable<[T, T2]>;
export function combineLatest<T, T2, TResult>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  project: (v1: T, v2: T2) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  third: ObservableOrPromiseOrIterator<T3>,
  scheduler?: Scheduler): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, TResult>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  third: ObservableOrPromiseOrIterator<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4>(
  first: ObservableOrPromiseOrIterator<T>,
  second: ObservableOrPromiseOrIterator<T2>,
  third: ObservableOrPromiseOrIterator<T3>,
  fourth: ObservableOrPromiseOrIterator<T4>,
  scheduler?: Scheduler): Observable<[T, T2, T3, T4]>;
export function combineLatest<T>(
  ...observables: Array<ObservableOrPromiseOrIterator<T> | ((...values: Array<T>) => T) | Scheduler>): Observable<T>;
export function combineLatest<T, R>(
  ...observables: Array<ObservableOrPromiseOrIterator<T> | ((...values: Array<T>) => R) | Scheduler>): Observable<R>;
export function combineLatest(
  ...observables: Array<any>): Observable<any> {
  let project, scheduler;

  if (isScheduler(observables[observables.length - 1])) {
    scheduler = observables.pop();
  }

  if (typeof observables[observables.length - 1] === 'function') {
    project = observables.pop();
  }

  return new ArrayObservable(observables, scheduler).lift(new CombineLatestOperator(project));
}
