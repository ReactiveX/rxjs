import mergeAll from './mergeAll';
import Observable from '../Observable';
import Scheduler from '../Scheduler';
import { CoreOperators } from '../CoreOperators';

export default function concatProto<R>(...observables: (Observable<any>|Scheduler)[]): Observable<R> {
  let args = <any[]>observables;
  args.unshift(this);
  if (args.length > 1 && typeof args[args.length - 1].schedule === 'function') {
    args.splice(args.length - 2, 0, 1);
  }
  return (<CoreOperators<any>>Observable.fromArray(args)).mergeAll(1);
}