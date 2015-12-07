import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {queue} from '../scheduler/queue';
import {MergeAllOperator} from './mergeAll-support';
import {ArrayObservable} from '../observable/fromArray';
import {isScheduler} from '../util/isScheduler';

/**
 * Joins multiple observables together by subscribing to them one at a time and merging their results
 * into the returned observable. Will wait for each observable to complete before moving on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concat<R>(...observables: Array<Observable<any> | Scheduler>): Observable<R> {
  let scheduler: Scheduler = queue;
  let args = <any[]>observables;
  if (isScheduler(args[observables.length - 1])) {
    scheduler = args.pop();
  }

  return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator(1));
}
