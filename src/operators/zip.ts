import Observable from '../Observable';
import zip from './zip-static';

export default function zipProto<R>(...observables: (Observable<any> | ((...values: Array<any>) => R))[]): Observable<R> {
  observables.unshift(this);
  return zip.apply(this, observables);
}