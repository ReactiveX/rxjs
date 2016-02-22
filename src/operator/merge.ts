import {Observable, ObservableInput} from '../Observable';
import {Scheduler} from '../Scheduler';
import {ArrayObservable} from '../observable/ArrayObservable';
import {MergeAllOperator} from './mergeAll';
import {isScheduler} from '../util/isScheduler';

/**
 * Creates a result Observable which emits values from every given input Observable.
 *
 * <img src="./img/merge.png" width="100%">
 *
 * @param {Observable} input Observables
 * @return {Observable} an Observable that emits items that are the result of every input Observable.
 * @method merge
 * @owner Observable
 */
export function merge<T, R>(...observables: Array<ObservableInput<any> | Scheduler | number>): Observable<R> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}

/* tslint:disable:max-line-length */
export interface MergeSignature<T> {
  (scheduler?: Scheduler): Observable<T>;
  (concurrent?: number, scheduler?: Scheduler): Observable<T>;
  <T2>(v2: ObservableInput<T2>, scheduler?: Scheduler): Observable<T | T2>;
  <T2>(v2: ObservableInput<T2>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2>;
  <T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: Scheduler): Observable<T | T2 | T3>;
  <T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3>;
  <T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
  <T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
  <T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
  <T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
  <T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
  <T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
  (...observables: Array<ObservableInput<T> | Scheduler | number>): Observable<T>;
  <R>(...observables: Array<ObservableInput<any> | Scheduler | number>): Observable<R>;
}
/* tslint:enable:max-line-length */

/* tslint:disable:max-line-length */
export function mergeStatic<T>(v1: ObservableInput<T>, scheduler?: Scheduler): Observable<T>;
export function mergeStatic<T>(v1: ObservableInput<T>, concurrent?: number, scheduler?: Scheduler): Observable<T>;
export function mergeStatic<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: Scheduler): Observable<T | T2>;
export function mergeStatic<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2>;
export function mergeStatic<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: Scheduler): Observable<T | T2 | T3>;
export function mergeStatic<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3>;
export function mergeStatic<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function mergeStatic<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function mergeStatic<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
export function mergeStatic<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
export function mergeStatic<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function mergeStatic<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function mergeStatic<T>(...observables: (ObservableInput<T> | Scheduler | number)[]): Observable<T>;
export function mergeStatic<T, R>(...observables: (ObservableInput<any> | Scheduler | number)[]): Observable<R>;
/* tslint:enable:max-line-length */
/**
 * @param observables
 * @return {Observable<R>}
 * @static true
 * @name merge
 * @owner Observable
 */
export function mergeStatic<T, R>(...observables: Array<ObservableInput<any> | Scheduler | number>): Observable<R> {
 let concurrent = Number.POSITIVE_INFINITY;
 let scheduler: Scheduler = null;
  let last: any = observables[observables.length - 1];
  if (isScheduler(last)) {
    scheduler = <Scheduler>observables.pop();
    if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
      concurrent = <number>observables.pop();
    }
  } else if (typeof last === 'number') {
    concurrent = <number>observables.pop();
  }

  if (observables.length === 1) {
    return <Observable<R>>observables[0];
  }

  return new ArrayObservable(<any>observables, scheduler).lift(new MergeAllOperator<R>(concurrent));
}
