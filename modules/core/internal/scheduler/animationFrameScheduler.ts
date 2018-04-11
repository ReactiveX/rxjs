import { asyncScheduler } from './asyncScheduler';
import { Subscription } from '../Subscription';

const toAnimate: Array<() => void> = [];
let animId = 0;
export function animationFrameScheduler(work?: () => void, delay?: number, subs?: Subscription): number {
  if (work) {
    if (delay > 0) {
      asyncScheduler(() => {
        animationFrameScheduler(work, 0, subs);
      }, delay, subs);
    } else {
      if (animId) {
        animId = requestAnimationFrame(() => {
          while (toAnimate.length > 0) {
            toAnimate.shift()();
          }
          animId = 0;
        });
      }
      toAnimate.push(work);
      subs.add(() => {
        const i = toAnimate.indexOf(work);
        if (i !== -1) {
          toAnimate.splice(i, 1);
        }
        if (toAnimate.length === 0) {
          cancelAnimationFrame(animId);
        }
      });
    }
  }
  return Date.now();
}
