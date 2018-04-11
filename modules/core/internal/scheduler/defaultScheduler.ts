import { asyncScheduler } from './asyncScheduler';
import { Subscription } from '../Subscription';

export function defaultScheduler(work?: () => void, delay?: number, subs?: Subscription): number {
  if (work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
      work();
    }
  }
  return Date.now();
}
