import {Observable} from '../Observable';
import {merge as mergeStatic} from './merge-static';
import {Scheduler} from '../Scheduler';

export function merge<T, R>(...observables: Array<Observable<any> | Scheduler | number>): Observable<R> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}
