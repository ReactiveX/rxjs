import { Observable } from '../Observable';
import { ISchedulerLike } from '../types';
import { Subscription } from '../Subscription';

export function schedulePromise<T>(input: PromiseLike<T>, scheduler: ISchedulerLike) {
  return new Observable<T>(subscriber => {
    const sub = new Subscription();
    sub.add(scheduler.schedule(() => input.then(
      value => {
        sub.add(scheduler.schedule(() => {
          subscriber.next(value);
          sub.add(scheduler.schedule(() => subscriber.complete()));
        }));
      },
      err => {
        sub.add(scheduler.schedule(() => subscriber.error(err)));
      }
    )));
    return sub;
  });
}
