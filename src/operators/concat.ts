import merge from './merge-static';
import Observable from '../Observable';

export default function concatProto<R>(...observables:any[]) : Observable<R> {
  observables.unshift(this);
  observables.push(1);
  return merge.apply(this, observables);
}