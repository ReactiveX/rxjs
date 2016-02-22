import {Observable, ObservableInput} from '../Observable';
import {Scheduler} from '../Scheduler';
import {isScheduler} from '../util/isScheduler';
import {ArrayObservable} from '../observable/ArrayObservable';
import {MergeAllOperator} from './mergeAll';

/**
 * Joins this observable with multiple other observables by subscribing to them one at a time, starting with the source,
 * and merging their results into the returned observable. Will wait for each observable to complete before moving
 * on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @return {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 * @method concat
 * @owner Observable
 */
export function concat<T, R>(...observables: Array<ObservableInput<any> | Scheduler>): Observable<R> {
  return concatStatic<T, R>(this, ...observables);
}

/* tslint:disable:max-line-length */
export interface ConcatSignature<T> {
  (scheduler?: Scheduler): Observable<T>;
  <T2>(v2: ObservableInput<T2>, scheduler?: Scheduler): Observable<T | T2>;
  <T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: Scheduler): Observable<T | T2 | T3>;
  <T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
  <T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
  <T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
  (...observables: Array<ObservableInput<T> | Scheduler>): Observable<T>;
  <R>(...observables: Array<ObservableInput<any> | Scheduler>): Observable<R>;
}
/* tslint:enable:max-line-length */

/**
 * Joins multiple observables together by subscribing to them one at a time and merging their results
 * into the returned observable. Will wait for each observable to complete before moving on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @return {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 * @static true
 * @name concat
 * @owner Observable
 */
/* tslint:disable:max-line-length */
export function concatStatic<T>(v1: ObservableInput<T>, scheduler?: Scheduler): Observable<T>;
export function concatStatic<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: Scheduler): Observable<T | T2>;
export function concatStatic<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: Scheduler): Observable<T | T2 | T3>;
export function concatStatic<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function concatStatic<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
export function concatStatic<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function concatStatic<T>(...observables: (ObservableInput<T> | Scheduler)[]): Observable<T>;
export function concatStatic<T, R>(...observables: (ObservableInput<any> | Scheduler)[]): Observable<R>;
/* tslint:enable:max-line-length */
export function concatStatic<T, R>(...observables: Array<ObservableInput<any> | Scheduler>): Observable<R> {
  let scheduler: Scheduler = null;
  let args = <any[]>observables;
  if (isScheduler(args[observables.length - 1])) {
    scheduler = args.pop();
  }

  return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator<R>(1));
}
