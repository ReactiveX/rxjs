/** @prettier */
import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { isFunction } from '../util/isFunction';

export function scheduleIterable<T>(input: Iterable<T>, scheduler: SchedulerLike) {
  if (!input) {
    throw new Error('Iterable cannot be null');
  }
  return new Observable<T>((subscriber) => {
    const sub = new Subscription();
    let iterator: Iterator<T>;
    sub.add(() => {
      // Finalize generators
      isFunction(iterator.return) && iterator.return();
    });
    sub.add(
      scheduler.schedule(() => {
        iterator = (input as any)[Symbol_iterator]();
        sub.add(
          scheduler.schedule(function () {
            if (subscriber.closed) {
              return;
            }
            let value: T;
            let done: boolean | undefined;
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
          })
        );
      })
    );
    return sub;
  });
}
