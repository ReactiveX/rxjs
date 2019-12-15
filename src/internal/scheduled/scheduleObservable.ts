import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { observable as Symbol_observable } from '../symbol/observable';
import { InteropObservable, ISchedulerLike, ISubscribable } from '../types';

export function scheduleObservable<T>(input: InteropObservable<T>, scheduler: ISchedulerLike) {
  return new Observable<T>(subscriber => {
    const sub = new Subscription();
    sub.add(scheduler.schedule(() => {
      const observable: ISubscribable<T> = input[Symbol_observable]();
      sub.add(observable.subscribe({
        next(value) { sub.add(scheduler.schedule(() => subscriber.next(value))); },
        error(err) { sub.add(scheduler.schedule(() => subscriber.error(err))); },
        complete() { sub.add(scheduler.schedule(() => subscriber.complete())); },
      }));
    }));
    return sub;
  });
}
