import { Observable } from '../Observable';
import { ISchedulerLike } from '../types';
import { Subscription } from '../Subscription';
import { iterator as Symbol_iterator } from '../symbol/iterator';

export function scheduleIterable<T>(input: Iterable<T>, scheduler: ISchedulerLike) {
  if (!input) {
    throw new Error('Iterable cannot be null');
  }
  return new Observable<T>(subscriber => {
    const sub = new Subscription();
    let iterator: Iterator<T>;
    sub.add(() => {
      // Finalize generators
      if (iterator && typeof iterator.return === 'function') {
        iterator.return();
      }
    });
    sub.add(scheduler.schedule(() => {
      iterator = input[Symbol_iterator]();
      sub.add(scheduler.schedule(function () {
        if (subscriber.closed) {
          return;
        }
        let value: T;
        let done: boolean;
        try {
          const result = iterator.next();
          value = result.value;
          done = result.done;
        } catch (err) {
          subscriber.error(err);
          return;
        }
        if (done) {
          subscriber.complete();
        } else {
          subscriber.next(value);
          this.schedule();
        }
      }));
    }));
    return sub;
  });
}
