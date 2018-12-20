import { SchedulerLike } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { Observable } from 'rxjs/internal/Observable';

export function interval(interval: number, scheduler: SchedulerLike = asyncScheduler) {
  interval = Math.max(0, interval);
  return new Observable<number>(subscriber => {
    const subscription = new Subscription();
    scheduler.schedule(intervalWork, interval, { i: 0, subscription, interval, subscriber, scheduler }, subscription);
    return subscription;
  });
}

export function intervalWork(
  state: { i: number, subscription: Subscription, interval: number, subscriber: Subscriber<number>, scheduler: SchedulerLike }
) {
  const { subscription, subscriber, interval, scheduler } = state;
  if (!subscription.closed) {
    subscriber.next(state.i++);
    scheduler.schedule(intervalWork, interval, state, subscription);
  }
}
