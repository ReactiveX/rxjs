import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';

export interface VirtualScheduler extends SchedulerLike {
  frameTimeFactor: number;
  index: number;
  maxFrames: number;
  flush(): void;
  frame: number;
}

interface VirtualAction<T=any> {
  index: number;
  delay: number;
  work: (state: T) => void;
  state: T|undefined;
  subs: Subscription;
}

export function createVirtualScheduler(maxFrames = Number.POSITIVE_INFINITY): VirtualScheduler {
  const actions: VirtualAction[] = [];
  let flushing = false;
  return {
    frame: 0,
    frameTimeFactor: 1,
    index: -1,
    maxFrames,

    schedule<T>(work: (state: T) => void, delay = 0, state = undefined as T, subs?: Subscription): Subscription {
      subs = subs || new Subscription();
      const action = {
        index: this.index++,
        delay: this.frame + delay,
        work,
        state,
        subs,
      };
      subs.add(() => {
        const i = actions.indexOf(action);
        if (i >= 0) {
          actions.splice(i, 1);
        }
      });
      actions.push(action);
      actions.sort(sortActions);
      return subs;
    },

    now(): number {
      return this.frame;
    },

    flush() {
      if (!flushing) {
        flushing = true;
        let action: VirtualAction;
        while ((action = actions.shift()) && (this.frame = action.delay) <= maxFrames) {
          try {
            action.work(action.state);
          } catch (err) {
            while(actions.length > 0) {
              actions.shift().subs.unsubscribe();
            }
            throw err;
          }
        }
        flushing = false;
      }
    },
  };
}

export const virtualScheduler = createVirtualScheduler();

function sortActions(a: VirtualAction, b: VirtualAction) {
  if (a.delay === b.delay) {
    if (a.index === b.index) {
      return 0;
    } else if (a.index > b.index) {
      return 1;
    } else {
      return -1;
    }
  } else if (a.delay > b.delay) {
    return 1;
  } else {
    return -1;
  }
}
