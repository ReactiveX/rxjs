import { asyncScheduler } from './asyncScheduler';
import { Subscription } from '../Subscription';

const queue: Array<() => void> = [];
let flushing = false;
export function queueScheduler(work?: () => void, delay?: number, subs?: Subscription): number {
  if (work) {
    if (delay > 0) {
      throw new Error('queueScheduler cannot schedule with a delay > 0');
    }
    subs.add(() => {
      const i = queue.indexOf(work);
      if (i !== -1) {
        queue.splice(i, 1);
      }
    });
    queue.push(work);
    if (!flushing) {
      flushing = true;
      while (queue.length > 0) {
        queue.shift();
      }
      flushing = false;
    }
  }
  return Date.now();
}
