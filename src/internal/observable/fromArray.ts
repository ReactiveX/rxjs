import { Observable } from '../Observable';
import { ISchedulerLike } from '../types';
import { subscribeToArray } from '../util/subscribeToArray';
import { scheduleArray } from '../scheduled/scheduleArray';

export function fromArray<T>(input: ArrayLike<T>, scheduler?: ISchedulerLike) {
  if (!scheduler) {
    return new Observable<T>(subscribeToArray(input));
  } else {
    return scheduleArray(input, scheduler);
  }
}
