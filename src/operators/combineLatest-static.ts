import {Observable, ObservableOrIterable} from '../Observable';
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
export function combineLatest<T>(first: ObservableOrIterable<T>, scheduler?: Scheduler): Observable<[T]>;
export function combineLatest<T, TResult>(first: ObservableOrIterable<T>, project: (v1: T) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, scheduler?: Scheduler): Observable<[T, T2]>;
export function combineLatest<T, T2, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, project: (v1: T, v2: T2) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, scheduler?: Scheduler): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, project: (v1: T, v2: T2, v3: T3) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, scheduler?: Scheduler): Observable<[T, T2, T3, T4]>;
export function combineLatest<T, T2, T3, T4, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5]>;
export function combineLatest<T, T2, T3, T4, T5, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6]>;
export function combineLatest<T, T2, T3, T4, T5, T6, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, eventh: ObservableOrIterable<T7>, scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6, T7]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, eventh: ObservableOrIterable<T7>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, T9>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, ninth: ObservableOrIterable<T9>, scheduler?: Scheduler): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, ninth: ObservableOrIterable<T9>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult, scheduler?: Scheduler): Observable<TResult>;
export function combineLatest<T>(...observables: Array<ObservableOrIterable<T> | ((...values: Array<T>) => T) | Scheduler>): Observable<T>;
export function combineLatest<T, R>(...observables: Array<ObservableOrIterable<T> | ((...values: Array<T>) => R) | Scheduler>): Observable<R>;
export function combineLatest(...observables: Array<any>): Observable<any> {
  let project, scheduler;

  if (isScheduler(observables[observables.length - 1])) {
    scheduler = observables.pop();
  }

  if (typeof observables[observables.length - 1] === 'function') {
    project = observables.pop();
  }

  return new ArrayObservable(observables, scheduler).lift(new CombineLatestOperator(project));
}
