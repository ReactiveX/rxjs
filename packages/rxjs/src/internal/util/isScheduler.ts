import type { SchedulerLike } from '../types.js';
import { isFunction } from '@rxjs/observable';

export function isScheduler(value: any): value is SchedulerLike {
  return value && isFunction(value.schedule);
}
