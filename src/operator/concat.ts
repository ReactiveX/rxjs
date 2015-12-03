import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {isScheduler} from '../util/isScheduler';
import {ArrayObservable} from '../observable/fromArray';
import {MergeAllOperator} from './mergeAll-support';

/**
 * Joins this observable with multiple other observables by subscribing to them one at a time, starting with the source,
 * and merging their results into the returned observable. Will wait for each observable to complete before moving
 * on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concat<R>(...observables: (Observable<any> | Scheduler)[]): Observable<R> {
  let args = <any[]>observables;
  args.unshift(this);

  let scheduler: Scheduler = null;
  if (isScheduler(args[args.length - 1])) {
    scheduler = args.pop();
  }

   return new ArrayObservable(args, scheduler).lift(new MergeAllOperator(1));
}
