import { Subscription } from 'rxjs/internal/Subscription';
import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { Scheduler } from 'rxjs/internal/types';

let flushing = false;
const queue: any[] = [];
export const queueScheduler: Scheduler = {
  now() {
    return Date.now();
  },
  schedule<T>(work: (state: T) => void, delay: number, state: T, subs: Subscription) {
    if (delay > 0) {
      return asyncScheduler.schedule(work, delay, state, subs);
    }
    let stop = false;
    subs.add(() => {
      const i = queue.indexOf(work);
      queue.splice(i, 2);
    });
    queue.push(work, state);
    if (!flushing) {
      flushing = true;
      while (queue.length > 0) {
        queue.shift()(queue.shift());
      }
      flushing = false;
    }
  }
}
