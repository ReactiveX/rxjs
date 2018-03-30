import { asyncScheduler, Observable, SchedulerLike } from 'rxjs';
import { timeInterval as higherOrder } from 'rxjs/operators';
import { TimeInterval } from 'rxjs/internal-compatibility';

/**
 * @param scheduler
 * @return {Observable<TimeInterval<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timeInterval
 * @owner Observable
 */
export function timeInterval<T>(this: Observable<T>, scheduler: SchedulerLike = asyncScheduler): Observable<TimeInterval<T>> {
  return higherOrder(scheduler)(this) as Observable<TimeInterval<T>>;
}
