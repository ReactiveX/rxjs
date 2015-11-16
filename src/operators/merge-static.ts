import {Scheduler} from '../Scheduler';
import {Observable, ObservableOrPromise, ArrayOrIterator} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {MergeAllOperator} from './mergeAll-support';
import {immediate} from '../schedulers/immediate';
import {isScheduler} from '../util/isScheduler';

export function merge<T>(
  first: ObservableOrPromise<T>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T>;
export function merge<T, T2>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2>;
export function merge<T, T2, T3>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3>;
export function merge<T, T2, T3, T4>(
  first: ObservableOrPromise<T>,
  second: ObservableOrPromise<T2>,
  third: ObservableOrPromise<T3>,
  forth: ObservableOrPromise<T4>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function merge<T>(...observables: (ObservableOrPromise<T> | Scheduler | number)[]): Observable<T>;
export function merge<T>(
  first: ArrayOrIterator<T>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T>;
export function merge<T, T2>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2>;
export function merge<T, T2, T3>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3>;
export function merge<T, T2, T3, T4>(
  first: ArrayOrIterator<T>,
  second: ArrayOrIterator<T2>,
  third: ArrayOrIterator<T3>,
  forth: ArrayOrIterator<T4>,
  concurrent?: number,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function merge<T>(...observables: (ArrayOrIterator<T> | Scheduler | number)[]): Observable<T>;
export function merge(...observables: Array<any>): Observable<any> {
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
