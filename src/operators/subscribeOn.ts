import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {SubscribeOnObservable} from '../observables/SubscribeOnObservable';

export function subscribeOn<T>(scheduler: Scheduler, delay?: number): Observable<T>;
export function subscribeOn<T>(scheduler: Scheduler, delay: number = 0): Observable<T> {
  return new SubscribeOnObservable<T>(this, delay, scheduler);
}
