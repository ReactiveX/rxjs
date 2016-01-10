import {Observable} from '../Observable';
import {merge as mergeStatic} from './merge-static';
import {Scheduler} from '../Scheduler';

/**
 * Flattens an Iterable of Observables into one Observable, without any transformation.
 *
 * <img src="./img/merge.png" width="100%">
 *
 * @param {Observable} the Iterable of Observables
 * @returns {Observable} an Observable that emits items that are the result of flattening the items emitted by the Observables in the Iterable
 */
export function merge<R>(...observables: (Observable<any>|Scheduler|number)[]): Observable<R> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}
