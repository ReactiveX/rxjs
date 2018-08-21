import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';
import { asyncScheduler } from '../scheduler/asyncScheduler';

const p = Promise.resolve();

export const asapScheduler: SchedulerLike = {
  now() {
    return Date.now();
  },
  schedule<T>(work: (state: T) => void, delay = 0, state = undefined as T, subs?: Subscription): Subscription {
    subs = subs || new Subscription();
    if (delay > 0) {
      asyncScheduler.schedule(work, delay, state, subs);
      return subs;
    }
    let stop = false;
    subs.add(() => stop = true);
    p.then(() => {
      if (!stop) {
        work(state);
      }
    });
    return subs;
  }
}
