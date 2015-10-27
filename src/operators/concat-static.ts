import Observable from '../Observable';
import Scheduler from '../Scheduler';
import immediate from '../schedulers/immediate';
import { CoreOperators } from '../CoreOperators';

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
    args.push(1, scheduler);
  }
  return (<CoreOperators<any>>Observable.fromArray(observables)).mergeAll(1);
}