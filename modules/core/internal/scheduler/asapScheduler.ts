import { Scheduler, Subs } from '../types';
import { asyncScheduler } from './asyncScheduler';
import { append } from '../Subscription';

const p = Promise.resolve();
export const asapScheduler: Scheduler = (work?: () => void, delay?: number, subs?: Subs): number => {
  if (delay > 0) {
    asyncScheduler(work, delay, subs);
  } else {
    let stop = false;
    append(subs, () => {
      stop = true;
    });

    p.then(() => {
      if (!stop) {
        work();
      }
    });
  }
  return Date.now();
};
