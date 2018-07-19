import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { Subscription } from 'rxjs/internal/Subscription';
import { Scheduler } from 'rxjs/internal/types';

const toAnimate: any[] = [];
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
    } else {
      toAnimate.push(work, state);
      subs.add(() => {
        const i = toAnimate.indexOf(work);
        if (i >= 0) {
          toAnimate.splice(i, 2);
          if (toAnimate.length === 0) {
            cancelAnimationFrame(animId);
          }
        }
      });
      if (toAnimate.length === 2) {
        animId = requestAnimationFrame(() => {
          while (toAnimate.length > 0) {
            toAnimate.shift()(toAnimate.shift());
          }
        });
      }
    }
  }
}
