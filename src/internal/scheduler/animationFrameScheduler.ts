import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { Subscription } from 'rxjs/internal/Subscription';
import { SchedulerLike } from 'rxjs/internal/types';

const toAnimate: any[] = [];
let animId = 0;
export const animationFrameScheduler: SchedulerLike = {
  now() {
    return Date.now();
  },
  schedule<T>(work: (state: T) => void,delay = 0, state = undefined as T, subs?: Subscription): Subscription {
    subs = subs || new Subscription();
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
    return subs;
  }
}
