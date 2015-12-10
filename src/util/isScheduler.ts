import {Scheduler} from '../Scheduler';
export function isScheduler<T>(value: any): value is Scheduler {
  return value && typeof (<any>value).schedule === 'function';
}
