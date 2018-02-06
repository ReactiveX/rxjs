import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Subscription } from '../Subscription';
import { subscribeToArray } from '../util/subscribeToArray';

export function fromArray<T>(input: ArrayLike<T>, scheduler?: IScheduler) {
  if (!scheduler) {
    return new Observable<T>(subscribeToArray(input));
  } else {
    return new Observable<T>(subscriber => {
      const sub = new Subscription();
      let i = 0;
      sub.add(scheduler.schedule(function () {
        if (i === input.length) {
          subscriber.complete();
          return;
        }
        subscriber.next(input[i++]);
        if (!subscriber.closed) {
          sub.add(this.schedule());
        }
      }));
      return sub;
    });
  }
}
