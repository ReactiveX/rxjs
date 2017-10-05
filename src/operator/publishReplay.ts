import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { publishReplay as higherOrder } from '../operators/publishReplay';

/**
 * @param bufferSize
 * @param windowTime
 * @param selector
 * @param scheduler
 * @return {Observable<T> | ConnectableObservable<T>}
 * @method publishReplay
 * @owner Observable
 */
export function publishReplay<T>(this: Observable<T>, bufferSize: number = Number.POSITIVE_INFINITY,
                                 windowTime: number = Number.POSITIVE_INFINITY,
                                 selector?: (source: Observable<T>) => Observable<T>,
                                 scheduler?: IScheduler): Observable<T> | ConnectableObservable<T> {
  return higherOrder(bufferSize, windowTime, selector, scheduler)(this);
}
