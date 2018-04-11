import { Subs } from '../types';
import { concatSubs } from '../util/concatSubs';

export function asyncScheduler(work?: () => void, delay?: number, subs?: Subs): number {
  if (work) {
    const id = setTimeout(work, delay);
    concatSubs(subs, () => clearTimeout(id));
  }
  return Date.now();
}
