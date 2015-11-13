import {Observable, ObservableOrPromiseOrIterable} from '../Observable';
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
  first: ObservableOrPromiseOrIterable<T>,
  scheduler?: Scheduler): Observable<[T]>;
export function combineLatest<T, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  project: (v1: T) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  scheduler?: Scheduler): Observable<[T, T2]>;
export function combineLatest<T, T2, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  project: (v1: T, v2: T2) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  scheduler?: Scheduler): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  project: (v1: T, v2: T2, v3: T3) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  scheduler?: Scheduler): Observable<[T, T2, T3, T4]>;
export function combineLatest<T, T2, T3, T4, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5]>;
export function combineLatest<T, T2, T3, T4, T5, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6]>;
export function combineLatest<T, T2, T3, T4, T5, T6, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  eventh: ObservableOrPromiseOrIterable<T7>,
  scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6, T7]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  eventh: ObservableOrPromiseOrIterable<T7>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eighth: ObservableOrPromiseOrIterable<T8>,
  scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eighth: ObservableOrPromiseOrIterable<T8>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, T9>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eighth: ObservableOrPromiseOrIterable<T8>,
  ninth: ObservableOrPromiseOrIterable<T9>,
  scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  fourth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eighth: ObservableOrPromiseOrIterable<T8>,
  ninth: ObservableOrPromiseOrIterable<T9>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult,
  scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T>(
  ...observables: Array<ObservableOrPromiseOrIterable<T> | ((...values: Array<T>) => T) | Scheduler>): Observable<T>;
export function combineLatest<T, R>(
  ...observables: Array<ObservableOrPromiseOrIterable<T> | ((...values: Array<T>) => R) | Scheduler>): Observable<R>;
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
