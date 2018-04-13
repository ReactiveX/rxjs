import { Scheduler } from '../types';
import { Subscription } from '../Subscription';
import { asyncScheduler } from './asyncScheduler';

const p = Promise.resolve();
export function asapScheduler(work?: () => void, delay?: 0, subs?: Subscription): number {
  if (work) {
    if (delay > 0) {
      asyncScheduler(() => asapScheduler(work, 0, subs), delay, subs);
    }

    let stop = false;
    subs.add(() => {
      stop = true;
    });

    p.then(() => {
      if (!stop) {
        work();
      }
    });
  }
  return Date.now();
}
