import { SchedulerLike } from '../types';
import { scheduleArray } from '../scheduled/scheduleArray.js';
import { fromArrayLike } from './from.js';

export function internalFromArray<T>(input: ArrayLike<T>, scheduler?: SchedulerLike) {
  return scheduler ? scheduleArray(input, scheduler) : fromArrayLike(input);
}
