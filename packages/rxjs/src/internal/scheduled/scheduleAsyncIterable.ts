import type { SchedulerLike } from '../types.js';
import { Observable } from '@rxjs/observable';
import { executeSchedule } from '../util/executeSchedule.js';

export function scheduleAsyncIterable<T>(input: AsyncIterable<T>, scheduler: SchedulerLike) {
  if (!input) {
    throw new Error('Iterable cannot be null');
  }
  return new Observable<T>((subscriber) => {
    executeSchedule(subscriber, scheduler, () => {
      const iterator = input[Symbol.asyncIterator]();
      executeSchedule(
        subscriber,
        scheduler,
        () => {
          iterator.next().then((result) => {
            if (result.done) {
              // This will remove the subscriptions from
              // the parent subscription.
              subscriber.complete();
            } else {
              subscriber.next(result.value);
            }
          });
        },
        0,
        true
      );
    });
  });
}
