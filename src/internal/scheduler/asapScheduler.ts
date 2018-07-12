import { Scheduler } from '../types';
import { Subscription } from '../Subscription';
import { asyncScheduler } from './asyncScheduler';

const p = Promise.resolve();

export const asapScheduler: Scheduler = {
  now() {
    return Date.now();
  },
  schedule<T>(work: (state: T) => void, delay: number, state: T, subs: Subscription) {
    if (delay > 0) {
      return asyncScheduler.schedule(work, delay, state, subs);
    }
    let stop = false;
    subs.add(() => stop = true);
    p.then(() => {
      if (!stop) {
        work(state);
      }
    });
  }
}
