import { FOType, FObs, FOArg, FSub, FSubType, FScheduler } from '../types';
import { createSubscription } from '../util/createSubscription';

export function asyncScheduler(work?: () => void, delay?: number, subs?: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
    const id = setTimeout(work, delay);
    subs(FSubType.ADD, () => clearTimeout(id));
  }
  return Date.now();
}