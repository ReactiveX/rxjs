import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/ArrayObservable';
import {ScalarObservable} from '../observable/ScalarObservable';
import {EmptyObservable} from '../observable/EmptyObservable';
import {concatStatic} from './concat';
import {isScheduler} from '../util/isScheduler';

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
