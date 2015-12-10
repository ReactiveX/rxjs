import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {SubscribeOnObservable} from '../observable/SubscribeOnObservable';

export function subscribeOn<T>(scheduler: Scheduler, delay: number = 0): Observable<T> {
  return new SubscribeOnObservable<T>(this, delay, scheduler);
}
