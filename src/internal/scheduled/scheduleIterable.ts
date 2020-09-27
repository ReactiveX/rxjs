/** @prettier */
import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { isFunction } from '../util/isFunction';

/**
 * Used in {@link scheduled} to create an observable from an Iterable.
 * @param input The iterable to create an observable from
 * @param scheduler The scheduler to use
 */
export function scheduleIterable<T>(input: Iterable<T>, scheduler: SchedulerLike) {
  return new Observable<T>((subscriber) => {
    let iterator: Iterator<T>;

    // Schedule the initial creation of the iterator from
    // the iterable. This is so the code in the iterable is
    // not called until the scheduled job fires.
    subscriber.add(
      scheduler.schedule(() => {
        // Create the iterator.
        iterator = (input as any)[Symbol_iterator]();

        // Schedule the first iteration and emission.
        subscriber.add(
          scheduler.schedule(function () {
            // Check to make sure teardown was not triggered
            // by the consumer since the last iteration.
            if (!subscriber.closed) {
              let value: T;
              let done: boolean | undefined;
              try {
                // Pull the value out of the iterator
                ({ value, done } = iterator.next());
              } catch (err) {
                subscriber.error(err);
                return;
              }
              if (done) {
                // If it is "done" we just complete. This mimics the
                // behavior of JavaScript's `for..of` consumption of
                // iterables, which will not emit the value from an iterator
                // result of `{ done: true: value: 'here' }`.
                subscriber.complete();
              } else {
                // The iterable is not done, emit the value.
                subscriber.next(value);
                // Reschedule. This will cause this function to be
                // called again on the same scheduled delay.
                this.schedule();
              }
            }
          })
        );
      })
    );

    // During teardown, if we see this iterator has a `return` method,
    // then we know it is a Generator, and not just an Iterator. So we call
    // the `return()` function. This will ensure that any `finally { }` blocks
    // inside of the generator we can hit will be hit properly.
    return () => isFunction(iterator?.return) && iterator.return();
  });
}
