import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/ArrayObservable';
import {ScalarObservable} from '../observable/ScalarObservable';
import {EmptyObservable} from '../observable/EmptyObservable';
import {concatStatic} from './concat';
import {isScheduler} from '../util/isScheduler';

/**
 * Returns an Observable that emits the items in a specified Iterable before it begins to emit items emitted by the
 * source Observable.
 *
 * <img src="./img/startWith.png" width="100%">
 *
 * @param {Values} an Iterable that contains the items you want the modified Observable to emit first.
 * @return {Observable} an Observable that emits the items in the specified Iterable and then emits the items
 * emitted by the source Observable.
 * @method startWith
 * @owner Observable
 */
export function startWith<T>(...array: Array<T | Scheduler>): Observable<T> {
  let scheduler = <Scheduler>array[array.length - 1];
  if (isScheduler(scheduler)) {
    array.pop();
  } else {
    scheduler = null;
  }

  const len = array.length;
  if (len === 1) {
    return concatStatic(new ScalarObservable<T>(<T>array[0], scheduler), <Observable<T>>this);
  } else if (len > 1) {
    return concatStatic(new ArrayObservable<T>(<T[]>array, scheduler), <Observable<T>>this);
  } else {
    return concatStatic(new EmptyObservable<T>(scheduler), <Observable<T>>this);
  }
}

export interface StartWithSignature<T> {
  (v1: T, scheduler?: Scheduler): Observable<T>;
  (v1: T, v2: T, scheduler?: Scheduler): Observable<T>;
  (v1: T, v2: T, v3: T, scheduler?: Scheduler): Observable<T>;
  (v1: T, v2: T, v3: T, v4: T, scheduler?: Scheduler): Observable<T>;
  (v1: T, v2: T, v3: T, v4: T, v5: T, scheduler?: Scheduler): Observable<T>;
  (v1: T, v2: T, v3: T, v4: T, v5: T, v6: T, scheduler?: Scheduler): Observable<T>;
  (...array: Array<T | Scheduler>): Observable<T>;
}
