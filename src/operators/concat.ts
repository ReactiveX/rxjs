import merge from './merge-static';
import Observable from '../Observable';
import Scheduler from '../Scheduler';

export default function concatProto<R>(...observables:(Observable<any>|Scheduler)[]) : Observable<R> {
  var args = <any[]>observables;
  args.unshift(this);
  if(args.length > 1 && typeof args[args.length - 1].schedule === 'function') {
    args.splice(args.length - 2, 0, 1);
  }
  return merge.apply(this, args);
}