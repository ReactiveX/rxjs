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
export function merge<T, T2, T3, T4, T5>(
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
export function merge<T, T2, T3, T4, T5, T6>(
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function merge<T, T2, T3, T4, T5, T6, T7>(
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
export function merge<T, T2, T3, T4, T5, T6, T7, T8>(
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eigth: ObservableOrPromiseOrIterable<T8>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
export function merge<T, T2, T3, T4, T5, T6, T7, T8, T9>(
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  eigth: ObservableOrPromiseOrIterable<T8>,
  ninth: ObservableOrPromiseOrIterable<T9>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
export function merge<T>(...observables: (ObservableOrPromiseOrIterable<T> | Scheduler | number)[]): Observable<T>;
export function merge(...observables: (ObservableOrPromiseOrIterable<any> | Scheduler | number)[]): Observable<any> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}
