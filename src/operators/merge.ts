import Observable from '../Observable';
import mergeStatic from './merge-static';
import Scheduler from '../Scheduler';

export default function merge<R>(...observables: (Observable<any>|Scheduler|number)[]): Observable<R> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}