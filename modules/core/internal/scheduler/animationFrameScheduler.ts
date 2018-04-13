import { asyncScheduler } from './asyncScheduler';
import { Subscription } from '../Subscription';

const toAnimate: Array<() => void> = [];
let animId = 0;
export function animationFrameScheduler(work?: () => void, delay?: 0, subs?: Subscription): number {
  if (work) {
    if (delay > 0) {
      throw new Error('animationFrameScheduler cannot schedule with a delay > 0');
    }

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
  return Date.now();
}
