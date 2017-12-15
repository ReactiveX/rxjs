import { Scheduler } from '../internal/Scheduler';
export function isScheduler(value: any): value is Scheduler {
  return value && typeof (<any>value).schedule === 'function';
}
