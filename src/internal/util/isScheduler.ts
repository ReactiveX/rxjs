import { ISchedulerLike } from '../types';

export function isScheduler(value: any): value is ISchedulerLike {
  return value && typeof (<any>value).schedule === 'function';
}
