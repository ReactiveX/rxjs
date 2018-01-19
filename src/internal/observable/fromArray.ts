import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Subscription } from '../Subscription';

export function fromArray<T>(input: ArrayLike<T>, scheduler: IScheduler) {
  if (!scheduler) {
    return new Observable<T>(subscriber => {
      for (let i = 0; i < input.length && !subscriber.closed; i++) {
        subscriber.next(input[i]);
      }
      subscriber.complete();
    });
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
