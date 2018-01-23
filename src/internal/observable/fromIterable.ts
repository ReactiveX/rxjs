import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Subscription } from '../Subscription';
import { iterator as Symbol_iterator } from '../symbol/iterator';

export function fromIterable<T>(input: Iterable<T>, scheduler: IScheduler) {
  if (!input) {
    throw new Error('Iterable cannot be null');
  }
  if (!scheduler) {
    return new Observable<T>(subscriber => {
      const iterator = input[Symbol_iterator]();
      let result: IteratorResult<T>;
      const nextResult = (): boolean => {
        try {
          result = iterator.next();
        } catch (err) {
          subscriber.error(err);
          return false;
        }
        return true;
      };
      while (nextResult() && !result.done && !subscriber.closed) {
        subscriber.next(result.value);
      }
      subscriber.complete();
      return () => {
        // Finalize generators if it happens to be a generator
        if (iterator && typeof (iterator as any).return === 'function') {
          iterator.return();
        }
      };
    });
  } else {
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
}
