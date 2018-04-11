import { Subs } from '../types';
import { asyncScheduler } from './asyncScheduler';
import { append } from '../Subscription';

const queue: Array<() => void> = [];
let flushing = false;
export function queueScheduler(work?: () => void, delay?: number, subs?: Subs): number {
  if (work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
      append(subs, () => {
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
  }
  return Date.now();
}
