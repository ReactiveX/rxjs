import { SchedulerLike } from '../types';
import { scheduleArray } from '../scheduled/scheduleArray';
import { fromArrayLike } from './from';

export function internalFromArray<T>(input: ArrayLike<T>, scheduler?: SchedulerLike) {
  return scheduler ? scheduleArray(input, scheduler) : fromArrayLike(input);
}
