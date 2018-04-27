import { asyncScheduler } from './asyncScheduler';
import { Subscription } from '../Subscription';
import { Scheduler } from '../types';

const toAnimate: Array<() => void> = [];
let animId = 0;
export const animationFrameScheduler: Scheduler = {
  now() {
    return Date.now();
  },
  schedule<T>(work: (state: T) => void, delay: number, state: T, subs: Subscription) {
    if (delay > 0) {
      asyncScheduler.schedule((state) => {
        animationFrameScheduler.schedule(work, 0, state, subs);
      }, delay, state, subs);
    }
  }
}
