import { FOType, FObs, FOArg, FSub, FSubType, FScheduler } from '../types';
import { createSubscription } from '../util/createSubscription';
import { asyncScheduler } from './asyncScheduler';

const toAnimate: Array<() => void> = [];
let animId = 0;
export function animationFrameScheduler(work?: () => void, delay?: number, subs?: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
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
      subs(FSubType.ADD, () => {
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