import { Subs} from '../types';
import { asyncScheduler } from './asyncScheduler';

export function defaultScheduler(work?: () => void, delay?: number, subs?: Subs): number {
  if (work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
      work();
    }
  }
  return Date.now();
}
