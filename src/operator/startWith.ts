import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {ScalarObservable} from '../observable/ScalarObservable';
import {EmptyObservable} from '../observable/empty';
import {concat} from './concat-static';
import {isScheduler} from '../util/isScheduler';

/**
 * Returns an Observable that emits the items in a specified Iterable before it begins to emit items emitted by the
 * source Observable.
 *
 * <img src="./img/startWith.png" width="100%">
 *
 * @param {Values} an Iterable that contains the items you want the modified Observable to emit first.
 * @returns {Observable} an Observable that emits the items in the specified Iterable and then emits the items
 * emitted by the source Observable.
 */
export function startWith<T>(...array: (T | Scheduler)[]): Observable<T> {
  let scheduler = <Scheduler>array[array.length - 1];
  if (isScheduler(scheduler)) {
    array.pop();
  } else {
    scheduler = null;
  }

  const len = array.length;
  if (len === 1) {
    return concat(new ScalarObservable(array[0], scheduler), this);
  } else if (len > 1) {
    return concat(new ArrayObservable(array, scheduler), this);
  } else {
    return concat(new EmptyObservable(scheduler), this);
  }
}
