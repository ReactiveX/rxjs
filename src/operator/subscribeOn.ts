import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {SubscribeOnObservable} from '../observable/SubscribeOnObservable';

/**
 * Asynchronously subscribes Observers to this Observable on the specified Scheduler.
 *
 * <img src="./img/subscribeOn.png" width="100%">
 *
 * @param {Scheduler} the Scheduler to perform subscription actions on.
 * @returns {Observable<T>} the source Observable modified so that its subscriptions happen on the specified Scheduler
 .
 */
export function subscribeOn<T>(scheduler: Scheduler, delay: number = 0): Observable<T> {
  return new SubscribeOnObservable(this, delay, scheduler);
}
