import {merge} from './merge';
import Observable from '../Observable';
import Scheduler from '../Scheduler';

export function concat<R>(...observables: any[]) : Observable<R> {
  let scheduler = Scheduler.immediate;
  const len = observables.length;
  if(typeof observables[observables.length - 1].schedule === 'function') {
    scheduler = observables.pop();
    observables.push(1, scheduler);
  }
  return merge.apply(this, observables);
}

export function concatProto<R>(...observables:any[]) : Observable<R> {
  observables.unshift(this);
  observables.push(1);
  return merge.apply(this, observables);
}