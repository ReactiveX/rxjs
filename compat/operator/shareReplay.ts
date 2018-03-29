import { Observable, SchedulerLike } from 'rxjs';
import { shareReplay as higherOrder } from 'rxjs/operators';

/**
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay<T>(this: Observable<T>, bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike):
  Observable<T> {
  return higherOrder(bufferSize, windowTime, scheduler)(this) as Observable<T>;
}
