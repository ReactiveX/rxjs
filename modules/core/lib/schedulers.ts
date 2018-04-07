import { FOType, FObs, FOArg, FSub, FSubType, FScheduler } from './types';
import { createSubscription } from './createSubscription';

export function asyncScheduler(work?: () => void, delay?: number, subs?: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
    const id = setTimeout(work, delay);
    subs(FSubType.ADD, () => clearTimeout(id));
  }
  return Date.now();
}

const p = Promise.resolve();
export function asapScheduler(work?: () => void, delay?: number, subs?: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
      let stop = false;
      p.then(() => {
        if (!stop) {
          work();
        }
      });
    }
  }
  return Date.now();
}

const toAnimate: Array<() => void> = [];
let animId = 0;
export function animationFrame(work?: () => void, delay?: number, subs?: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
    if (delay > 0) {
      asyncScheduler(() => {
        animationFrame(work, 0, subs);
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

export function defaultScheduler(work: () => void, delay: number, subs: FSub): number {
  if (!subs(FSubType.CHECK) && work) {
    if (delay > 0) {
      asyncScheduler(work, delay, subs);
    } else {
      work();
    }
  }
  return Date.now();
}

const queue = [];
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