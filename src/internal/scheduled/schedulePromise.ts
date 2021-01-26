import { Observable } from '../Observable';
import { SchedulerLike } from '../types';

export function schedulePromise<T>(input: PromiseLike<T>, scheduler: SchedulerLike) {
  return new Observable<T>((subscriber) => {
    return scheduler.schedule(() =>
      input.then(
        (value) => {
          subscriber.add(
            scheduler.schedule(() => {
              subscriber.next(value);
              subscriber.add(scheduler.schedule(() => subscriber.complete()));
            })
          );
        },
        (err) => {
          subscriber.add(scheduler.schedule(() => subscriber.error(err)));
        }
      )
    );
  });
}
