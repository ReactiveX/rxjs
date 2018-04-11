import { Scheduler } from '../types';
import { asyncScheduler } from './asyncScheduler';
import { Subscription } from '../Subscription';

const p = Promise.resolve();
export function asapScheduler(work?: () => void, delay?: number, subs?: Subscription): number {
  if (work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
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
  }
  return Date.now();
}
