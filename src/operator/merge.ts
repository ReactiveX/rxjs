import {Observable} from '../Observable';
import {merge as mergeStatic} from './merge-static';
import {Scheduler} from '../Scheduler';

/**
 * Creates a result Observable which emits values from every given input Observable.
 *
 * <img src="./img/merge.png" width="100%">
 *
 * @param {Observable} input Observables
 * @returns {Observable} an Observable that emits items that are the result of every input Observable.
 */
export function merge<T, R>(...observables: Array<Observable<any> | Scheduler | number>): Observable<R> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}
