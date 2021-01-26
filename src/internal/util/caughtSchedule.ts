import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { SchedulerAction, SchedulerLike } from '../types';

export function caughtSchedule(
  subscriber: Subscriber<any>,
  scheduler: SchedulerLike,
  execute: (this: SchedulerAction<any>) => void,
  delay = 0
): Subscription {
  const subscription = scheduler.schedule(function () {
    try {
      execute.call(this);
    } catch (err) {
      subscriber.error(err);
    }
  }, delay);
  subscriber.add(subscription);
  return subscription;
}
