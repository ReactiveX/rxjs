import {Scheduler} from '../Scheduler';
import {Observable, IObservable} from '../Observable';
import {SubscribeOnObservable} from '../observable/SubscribeOnObservable';

/**
 * Asynchronously subscribes Observers to this Observable on the specified Scheduler.
 *
 * <img src="./img/subscribeOn.png" width="100%">
 *
 * @param {Scheduler} the Scheduler to perform subscription actions on.
 * @return {Observable<T>} the source Observable modified so that its subscriptions happen on the specified Scheduler
 .
 * @method subscribeOn
 * @owner Observable
 */
export function subscribeOn<T>(scheduler: Scheduler, delay: number = 0): IObservable<T> {
  return new SubscribeOnObservable<T>(this, delay, scheduler);
}

export interface SubscribeOnSignature<T> {
  (scheduler: Scheduler, delay?: number): IObservable<T>;
}