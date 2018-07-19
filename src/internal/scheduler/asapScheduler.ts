import { Scheduler } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';

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
