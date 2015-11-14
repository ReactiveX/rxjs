import {Observable, ObservableOrPromiseOrIterable} from '../Observable';
import {merge as mergeStatic} from './merge-static';
import {Scheduler} from '../Scheduler';

export function merge<T, T2>(
  second: ObservableOrPromiseOrIterable<T2>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2>;
export function merge<T, T2, T3>(
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3>;
export function merge<T, T2, T3, T4>(
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function merge<T>(...observables: (ObservableOrPromiseOrIterable<T> | Scheduler | number)[]): Observable<T>;
export function merge(...observables: (ObservableOrPromiseOrIterable<any> | Scheduler | number)[]): Observable<any> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}
