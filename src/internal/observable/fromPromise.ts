import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
import { subscribeToPromise } from '../util/subscribeToPromise';
import { schedulePromise } from '../scheduled/schedulePromise';

export function fromPromise<T>(input: PromiseLike<T>, scheduler?: SchedulerLike) {
  if (!scheduler) {
    // Below we're relying on an implemenation detail that the subscriber
    // passed is also a Subscription.
    return new Observable<T>(subscribeToPromise(input) as any);
  } else {
    return schedulePromise(input, scheduler);
  }
}
