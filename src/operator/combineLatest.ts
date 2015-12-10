import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {CombineLatestOperator} from './combineLatest-support';
import {isArray} from '../util/isArray';
import {ObservableInput} from '../types';

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
export function combineLatest<T, TResult>(project: (v1: T) => TResult): Observable<TResult>;
export function combineLatest<T, TResult>(project: (v1: T) => TResult): Observable<TResult>;
/*-- *compute 2-6* export function combineLatest<T, {|X|}>({|v|: ObservableInput<|X|>}): Observable<[T, {|X|}]>; --*/
/*-- *compute 2-6* export function combineLatest<T, {|X|}>(array: [{ObservableInput<|X|>}]): Observable<[T, {|X|}]>; --*/
/*-- *compute 2-6* export function combineLatest<T, {|X|}, TResult>({|v|: ObservableInput<|X|>},
                                                                    project: (v1: T, {|v|: |X|}) => TResult): Observable<TResult>; --*/
/*-- *compute 2-6* export function combineLatest<T, {|X|}, TResult>(array: [{ObservableInput<|X|>}],
                                                                    project: (v1: T, {|v|: |X|}) => TResult): Observable<TResult>; --*/
export function combineLatest<T, TResult>(array: ObservableInput<any>[], project?: Function): Observable<TResult[]>;
export function combineLatest<T>(...observables: Array<ObservableInput<T>>): Observable<T[]>;
export function combineLatest<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function combineLatest<R>(...observables: Array<any | Observable<any> |
                                                       Array<Observable<any>> |
                                                       ((...values: Array<any>) => R)>): Observable<R> {
  let project: (...values: Array<any>) => R = null;
  if (typeof observables[observables.length - 1] === 'function') {
    project = <(...values: Array<any>) => R>observables.pop();
  }

  // if the first and only other argument besides the resultSelector is an array
  // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
  if (observables.length === 1 && isArray(observables[0])) {
    observables = <any>observables[0];
  }

  observables.unshift(this);

  return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}
