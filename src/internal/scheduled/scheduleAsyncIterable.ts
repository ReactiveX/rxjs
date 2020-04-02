import { SchedulerLike } from '../types';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';

export function scheduleAsyncIterable<T>(input: AsyncIterable<T>, scheduler: SchedulerLike) {
  if (!input) {
    throw new Error('Iterable cannot be null');
  }
  return new Observable<T>(subscriber => {
    const sub = new Subscription();
    sub.add(
      scheduler.schedule(() => {
        const iterator = input[Symbol.asyncIterator]();
        sub.add(scheduler.schedule(function () {
          iterator.next().then(result => {
            if (result.done) {
              subscriber.complete();
            } else {
              subscriber.next(result.value);
              this.schedule();
            }
          });
        }));
      })
    );
    return sub;
  });
}
