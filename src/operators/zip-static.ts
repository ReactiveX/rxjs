import Observable from '../Observable';
import ArrayObservable from '../observables/ArrayObservable';
import { ZipOperator } from './zip-support';

export default function zip<T, R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R> {
  const project = <((...ys: Array<any>) => R)> observables[observables.length - 1];
  if (typeof project === 'function') {
    observables.pop();
  }
  return new ArrayObservable(observables).lift(new ZipOperator(project));
}