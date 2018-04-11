import { Subs } from '../types';
import { asyncScheduler } from './asyncScheduler';
import { concatSubs } from '../util/concatSubs';

const toAnimate: Array<() => void> = [];
let animId = 0;
export function animationFrameScheduler(work?: () => void, delay?: number, subs?: Subs): number {
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
      concatSubs(subs, () => {
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
