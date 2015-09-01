import Observable from '../Observable';
import mergeStatic from './merge-static';

export default function merge<R>(...observables: (Observable<any>|number)[]): Observable<R> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}