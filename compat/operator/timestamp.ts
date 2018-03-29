import { asyncScheduler, Observable, SchedulerLike } from 'rxjs';
import { timestamp as higherOrder} from 'rxjs/operators';
import { Timestamp } from 'rxjs/internal-compatibility';
/**
 * @param scheduler
 * @return {Observable<Timestamp<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timestamp
 * @owner Observable
 */
export function timestamp<T>(this: Observable<T>, scheduler: SchedulerLike = asyncScheduler): Observable<Timestamp<T>> {
  return higherOrder(scheduler)(this) as Observable<Timestamp<T>>;
}
