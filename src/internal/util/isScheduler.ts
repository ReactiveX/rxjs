import { SchedulerLike } from 'rxjs/internal/types';

export function isScheduler(value: any): value is SchedulerLike {
  return Boolean(value && typeof (<any>value).schedule === 'function');
}
