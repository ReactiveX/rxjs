import { Observable } from '@rxjs/observable';
import type { SchedulerLike } from '../types.js';
import { executeSchedule } from '../util/executeSchedule.js';

export function scheduleArray<T>(input: ArrayLike<T>, scheduler: SchedulerLike) {
  return new Observable<T>((subscriber) => {
    // The current array index.
    let i = 0;
    const emit = () => {
      // If we have hit the end of the array, complete.
      if (i === input.length) {
        subscriber.complete();
      } else {
        // Otherwise, next the value at the current index,
        // then increment our index.
        subscriber.next(input[i++]);
        executeSchedule(subscriber, scheduler, emit);
      }
    };

    // Start iterating over the array like on a schedule.
    return executeSchedule(subscriber, scheduler, emit);
  });
}
