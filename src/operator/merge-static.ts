import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {MergeAllOperator} from './mergeAll-support';
import {queue} from '../scheduler/queue';
import {isScheduler} from '../util/isScheduler';

export function merge<R>(...observables: Array<Observable<any> | Scheduler | number>): Observable<R> {
 let concurrent = Number.POSITIVE_INFINITY;
 let scheduler: Scheduler = queue;
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
    return <Observable<R>>observables[0];
  }

  return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator(concurrent));
}
