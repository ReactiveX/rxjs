import { FOType, FObs, FOArg, FSub, FSubType, FScheduler } from '../types';
import { createSubscription } from '../util/createSubscription';
import { asyncScheduler } from './asyncScheduler';

const queue: Array<() => void> = [];
let flushing = false;
export function queueScheduler(work?: () => void, delay?: number, subs?: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
      subs(FSubType.ADD, () => {
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