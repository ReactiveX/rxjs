import { SchedulerLike } from '../types.js';
import { isFunction } from './isFunction.js';

export function isScheduler(value: any): value is SchedulerLike {
  return value && isFunction(value.schedule);
}
