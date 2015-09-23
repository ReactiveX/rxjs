import Observable from '../Observable';
import ArrayObservable from '../observables/ArrayObservable';
import { CombineLatestOperator } from './combineLatest-support';
import Scheduler from '../Scheduler';

export default function combineLatest<T, R>(...observables: (Observable<any> | ((...values: Array<any>) => R) | Scheduler)[]): Observable<R> {
  let project, scheduler;
  
  if(typeof (<any>observables[observables.length - 1]).schedule === 'function') {
    scheduler = observables.pop();
  }
  
  if (typeof observables[observables.length - 1] === 'function') {
    project = observables.pop();
  }
  
  return new ArrayObservable(observables, scheduler).lift(new CombineLatestOperator(project));
}