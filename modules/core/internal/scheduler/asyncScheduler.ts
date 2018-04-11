import { Subs } from '../types';
import { append } from '../Subscription';

export function asyncScheduler(work?: () => void, delay?: number, subs?: Subs): number {
  if (work) {
    const id = setTimeout(work, delay);
    append(subs, () => clearTimeout(id));
  }
  return Date.now();
}
