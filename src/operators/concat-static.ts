import merge from './merge-static';
import Observable from '../Observable';
import Scheduler from '../Scheduler';

export default function concat<R>(...observables: any[]) : Observable<R> {
  let scheduler = Scheduler.immediate;
  const len = observables.length;
  if(typeof observables[observables.length - 1].schedule === 'function') {
    scheduler = observables.pop();
    observables.push(1, scheduler);
  }
  return merge.apply(this, observables);
}