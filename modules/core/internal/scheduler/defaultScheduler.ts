import { FOType, FObs, FOArg, FSub, FSubType, FScheduler } from '../types';
import { createSubscription } from '../util/createSubscription';
import { asyncScheduler } from './asyncScheduler';

export function defaultScheduler(work: () => void, delay: number, subs: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
      work();
    }
  }
  return Date.now();
}