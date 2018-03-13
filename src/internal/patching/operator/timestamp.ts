import { Observable } from '../../Observable';
import { SchedulerLike } from '../../types';
import { async } from '../../scheduler/async';
import { timestamp as higherOrder, Timestamp } from '../../operators/timestamp';
/**
 * @param scheduler
 * @return {Observable<Timestamp<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timestamp
 * @owner Observable
 */
export function timestamp<T>(this: Observable<T>, scheduler: SchedulerLike = async): Observable<Timestamp<T>> {
  return higherOrder(scheduler)(this) as Observable<Timestamp<T>>;
}
