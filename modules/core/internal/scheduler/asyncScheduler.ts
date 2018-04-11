import { Subscription } from '../Subscription';

export function asyncScheduler(work?: () => void, delay?: number, subs?: Subscription): number {
  if (work) {
    const id = setTimeout(work, delay);
    subs.add(() => clearTimeout(id));
  }
  return Date.now();
}
