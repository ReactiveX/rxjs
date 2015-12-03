import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {ZipOperator} from './zip-support';

export function zip<T, R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R> {
  const project = <((...ys: Array<any>) => R)> observables[observables.length - 1];
  if (typeof project === 'function') {
    observables.pop();
  }
  return new ArrayObservable(observables).lift(new ZipOperator(project));
}
