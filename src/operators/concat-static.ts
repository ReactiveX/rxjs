import Observable from '../Observable';
import Scheduler from '../Scheduler';
import immediate from '../schedulers/immediate';
import { MergeAllOperator } from './mergeAll-support';
import ArrayObservable from '../observables/ArrayObservable';

/**
 * Joins multiple observables together by subscribing to them one at a time and merging their results
 * into the returned observable. Will wait for each observable to complete before moving on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export default function concat<R>(...observables: Array<Observable<any> | Scheduler>): Observable<R> {
  let scheduler: Scheduler = immediate;
  let args = <any[]>observables;
  if (typeof (args[observables.length - 1]).schedule === 'function') {
    scheduler = args.pop();
  }

  return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator(1));
}