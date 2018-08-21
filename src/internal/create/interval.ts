import { sourceAsObservable } from  '../util/sourceAsObservable';
import { FOType, Sink, SchedulerLike } from '../types';
import { Subscription } from '../Subscription';
import { asyncScheduler } from '../scheduler/asyncScheduler';

export function interval(interval: number, scheduler: SchedulerLike = asyncScheduler) {
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<number>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const state = { i: 0, subs, interval, dest, scheduler };
      scheduler.schedule(intervalWork, interval, state, subs);
    }
  });
}

export function intervalWork(state: { i: number, subs: Subscription, interval: number, dest: Sink<number>, scheduler: SchedulerLike }) {
  const { subs, dest, interval, scheduler } = state;
  if (!subs.closed) {
    dest(FOType.NEXT, state.i++, subs);
    scheduler.schedule(intervalWork, interval, state, subs);
  }
}
