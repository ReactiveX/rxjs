import Scheduler from '../Scheduler';
import Observable from '../Observable';
import ArrayObservable from '../observables/ArrayObservable';
import { MergeOperator } from './merge-support';
import immediate from '../schedulers/immediate';

export default function merge<R>(...observables: (Observable<any>|Scheduler|number)[]): Observable<R> {
  let concurrent = Number.POSITIVE_INFINITY;
  let scheduler:Scheduler = immediate;
  let last:any = observables[observables.length - 1];
  if (typeof last.schedule === 'function') {
    scheduler = <Scheduler>observables.pop();
    if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
      concurrent = <number>observables.pop();
    }
  } else if (typeof last === 'number') {
    concurrent = <number>observables.pop();
  }

  if(observables.length === 1) {
    return <Observable<R>>observables[0];
  }

  return new ArrayObservable(observables, scheduler).lift(new MergeOperator(concurrent));
}