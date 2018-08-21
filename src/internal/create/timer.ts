import { FOType, Sink, SchedulerLike }  from '../types';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { Subscription } from '../Subscription';
import { asyncScheduler } from '../scheduler/asyncScheduler';
import { intervalWork } from './interval';

export function timer<T>(delay = 0, interval = -1, scheduler = asyncScheduler) {
  return sourceAsObservable((type = FOType.SUBSCRIBE, dest: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      scheduler.schedule(timerDelayWork as any, delay, {
        dest,
        scheduler,
        subs,
        i: 0,
        interval,
      }, subs);
    }
  });
}

function timerDelayWork<T>(state: { dest: Sink<T>, scheduler: SchedulerLike, subs: Subscription, i: number, interval: number }) {
  const { dest, scheduler, subs, interval } = state;
  if (subs.closed) return;
  dest(FOType.NEXT, state.i++, subs);
  if (!subs.closed && interval >= 0) {
    scheduler.schedule(intervalWork, interval, state, subs);
  }
}
