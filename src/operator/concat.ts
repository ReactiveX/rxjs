import {Observable} from '../Observable';
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
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concat<T, R>(...observables: Array<Observable<any> | Scheduler>): Observable<R> {
  return concatStatic(this, ...observables);
}

/**
 * Joins multiple observables together by subscribing to them one at a time and merging their results
 * into the returned observable. Will wait for each observable to complete before moving on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concatStatic<T, R>(...observables: Array<Observable<any> | Scheduler>): Observable<R> {
  let scheduler: Scheduler = null;
  let args = <any[]>observables;
  if (isScheduler(args[observables.length - 1])) {
    scheduler = args.pop();
  }

  return new ArrayObservable(observables, scheduler).lift<Observable<T>, T | R>(new MergeAllOperator<T | R>(1));
}
