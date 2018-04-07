import { FOType, FObs, FOArg, FSub, FSubType, FScheduler } from '../types';
import { createSubscription } from '../util/createSubscription';
import { asyncScheduler } from './asyncScheduler';

const p = Promise.resolve();
export function asapScheduler(work?: () => void, delay?: number, subs?: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
      let stop = false;
      p.then(() => {
        if (!stop) {
          work();
        }
      });
    }
  }
  return Date.now();
}