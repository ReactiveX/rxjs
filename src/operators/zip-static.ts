import {Observable} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {ZipOperator} from './zip-support';

export function zip<T, R>(...observables: Array<Observable<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function zip(...observables: Array<Observable<any> | ((...values: Array<any>) => any)>): Observable<any> {
  const project = <((...ys: Array<any>) => any)> observables[observables.length - 1];
  if (typeof project === 'function') {
    observables.pop();
  }
  return new ArrayObservable(observables).lift(new ZipOperator(project));
}