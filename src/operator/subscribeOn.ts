import { Operator } from '../Operator';
import { IScheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';
import { SubscribeOnObservable } from '../observable/SubscribeOnObservable';

/**
 * Asynchronously subscribes Observers to this Observable on the specified IScheduler.
 *
 * <img src="./img/subscribeOn.png" width="100%">
 *
 * @param {Scheduler} scheduler - The IScheduler to perform subscription actions on.
 * @return {Observable<T>} The source Observable modified so that its subscriptions happen on the specified IScheduler.
 .
 * @method subscribeOn
 * @owner Observable
 */
export function subscribeOn<T>(this: Observable<T>, scheduler: IScheduler, delay: number = 0): Observable<T> {
  return this.lift(new SubscribeOnOperator<T>(scheduler, delay));
}

class SubscribeOnOperator<T> implements Operator<T, T> {
  constructor(private scheduler: IScheduler,
              private delay: number) {
  }
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return new SubscribeOnObservable(
      source, this.delay, this.scheduler
    ).subscribe(subscriber);
  }
}
