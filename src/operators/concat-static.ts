import mergeAll from './mergeAll';
import Observable from '../Observable';
import Scheduler from '../Scheduler';
import immediate from '../schedulers/immediate';

export default function concat<R>(...observables: (Observable<any>|Scheduler)[]) : Observable<R> {
  let scheduler:Scheduler = immediate;
  let args = <any[]>observables;
  const len = args.length;
  if(typeof (args[observables.length - 1]).schedule === 'function') {
    scheduler = args.pop();
    args.push(1, scheduler);
  }
  return Observable.fromArray(observables).mergeAll(1);
}