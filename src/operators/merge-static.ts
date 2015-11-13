import {Scheduler} from '../Scheduler';
import {Observable, ObservableOrPromiseOrIterable} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {MergeAllOperator} from './mergeAll-support';
import {immediate} from '../schedulers/immediate';
import {isScheduler} from '../util/isScheduler';

export function merge<T>(
  first: ObservableOrPromiseOrIterable<T>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T>;
export function merge<T, T2>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2>;
export function merge<T, T2, T3>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3>;
export function merge<T, T2, T3, T4>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function merge<T, T2, T3, T4, T5>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
export function merge<T, T2, T3, T4, T5, T6>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function merge<T, T2, T3, T4, T5, T6, T7>(
  first: ObservableOrPromiseOrIterable<T>,
  second: ObservableOrPromiseOrIterable<T2>,
  third: ObservableOrPromiseOrIterable<T3>,
  forth: ObservableOrPromiseOrIterable<T4>,
  fifth: ObservableOrPromiseOrIterable<T5>,
  sixth: ObservableOrPromiseOrIterable<T6>,
  seventh: ObservableOrPromiseOrIterable<T7>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
export function merge<T, T2, T3, T4, T5, T6, T7, T8>(
  first: ObservableOrPromiseOrIterable<T>,
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
  first: ObservableOrPromiseOrIterable<T>,
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
export function merge(...observables: Array<ObservableOrPromiseOrIterable<any> | Scheduler | number>): Observable<any> {
  let concurrent = Number.POSITIVE_INFINITY;
  let scheduler: Scheduler = immediate;
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
    return <Observable<any>>observables[0];
  }

  return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator(concurrent));
}
