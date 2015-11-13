import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {isScheduler} from '../util/isScheduler';

/**
 * Joins this observable with multiple other observables by subscribing to them one at a time, starting with the source,
 * and merging their results into the returned observable. Will wait for each observable to complete before moving
 * on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concat<T, T2>(
  second: Observable<T2>,
  scheduler?: Scheduler): Observable<T | T2>;
export function concat<T, T2, T3>(
  second: Observable<T2>,
  third: Observable<T3>,
  scheduler?: Scheduler): Observable<T | T2 | T3>;
export function concat<T, T2, T3, T4>(
  second: Observable<T2>,
  third: Observable<T3>,
  forth: Observable<T4>,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
export function concat<T, T2, T3, T4, T5>(
  second: Observable<T2>,
  third: Observable<T3>,
  forth: Observable<T4>,
  fifth: Observable<T5>,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
export function concat<T, T2, T3, T4, T5, T6>(
  second: Observable<T2>,
  third: Observable<T3>,
  forth: Observable<T4>,
  fifth: Observable<T5>,
  sixth: Observable<T6>,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function concat<T, T2, T3, T4, T5, T6, T7>(
  second: Observable<T2>,
  third: Observable<T3>,
  forth: Observable<T4>,
  fifth: Observable<T5>,
  sixth: Observable<T6>,
  seventh: Observable<T7>,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
export function concat<T, T2, T3, T4, T5, T6, T7, T8>(
  second: Observable<T2>,
  third: Observable<T3>,
  forth: Observable<T4>,
  fifth: Observable<T5>,
  sixth: Observable<T6>,
  seventh: Observable<T7>,
  eigth: Observable<T8>,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
export function concat<T, T2, T3, T4, T5, T6, T7, T8, T9>(
  second: Observable<T2>,
  third: Observable<T3>,
  forth: Observable<T4>,
  fifth: Observable<T5>,
  sixth: Observable<T6>,
  seventh: Observable<T7>,
  eigth: Observable<T8>,
  ninth: Observable<T9>,
  scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
export function concat<T>(...observables: (Observable<T> | Scheduler)[]): Observable<T>;
export function concat(...observables: (Observable<any> | Scheduler)[]): Observable<any> {
  let args = <any[]>observables;
  args.unshift(this);
  if (args.length > 1 && isScheduler(args[args.length - 1])) {
    args.splice(args.length - 2, 0, 1);
  }
  return Observable.fromArray(args).mergeAll(1);
}
