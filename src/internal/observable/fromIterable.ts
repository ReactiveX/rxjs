import { Observable } from '../Observable';
import { ISchedulerLike } from '../types';
import { subscribeToIterable } from '../util/subscribeToIterable';
import { scheduleIterable } from '../scheduled/scheduleIterable';

export function fromIterable<T>(input: Iterable<T>, scheduler?: ISchedulerLike) {
  if (!input) {
    throw new Error('Iterable cannot be null');
  }
  if (!scheduler) {
    // Below we're relying on an implemenation detail that the subscriber
    // passed is also a Subscription.
    return new Observable<T>(subscribeToIterable(input) as any);
  } else {
    return scheduleIterable(input, scheduler);
  }
}
