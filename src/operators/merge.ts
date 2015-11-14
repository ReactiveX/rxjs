import {Observable, ObservableOrPromiseOrIterator} from '../Observable';
import {merge as mergeStatic} from './merge-static';
import {Scheduler} from '../Scheduler';

export function merge<T, T2>(
  second: ObservableOrPromiseOrIterator<T2>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2>;
export function merge<T, T2, T3>(
  second: ObservableOrPromiseOrIterator<T2>,
  third: ObservableOrPromiseOrIterator<T3>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3>;
export function merge<T, T2, T3, T4>(
  second: ObservableOrPromiseOrIterator<T2>,
  third: ObservableOrPromiseOrIterator<T3>,
  forth: ObservableOrPromiseOrIterator<T4>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function merge<T>(...observables: (ObservableOrPromiseOrIterator<T> | Scheduler | number)[]): Observable<T>;
export function merge(...observables: (ObservableOrPromiseOrIterator<any> | Scheduler | number)[]): Observable<any> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}
