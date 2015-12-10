import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {ScalarObservable} from '../observable/ScalarObservable';
import {EmptyObservable} from '../observable/empty';
import {concat} from './concat-static';
import {isScheduler} from '../util/isScheduler';

export function startWith<T>(...array: Array<T | Scheduler>): Observable<T> {
  let scheduler = <Scheduler>array[array.length - 1];
  if (isScheduler(scheduler)) {
    array.pop();
  } else {
    scheduler = void 0;
  }

  const len = array.length;
  if (len === 1) {
    return concat(new ScalarObservable<T>(<T>array[0], scheduler), this as Observable<T>);
  } else if (len > 1) {
    return concat(new ArrayObservable<T>(<T[]>array, scheduler), this as Observable<T>);
  } else {
    return concat(new EmptyObservable<T>(scheduler), this as Observable<T>);
  }
}
