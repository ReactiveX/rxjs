import { FOType, FObs, FOArg, FSub, FSubType, FScheduler } from '../types';
import { createSubscription } from '../util/createSubscription';
import { asyncScheduler } from './asyncScheduler';

/**
 * Since the scheduler API changed with this version, the VirtualScheduler is now
 * different. It's a function that returns a controller object. You would use
 * the `scheduler` instance on the controller object as the scheduler.
 */
export function virtualScheduler() {
  let time = 0;
  let buffer: Array<VirtualWork> = [];

  function updateSort() {
    buffer.sort((a, b) => a.due === b.due ? 0 : (a.due > b.due ? 1 : -1));
  }

  return {
    scheduler: (work?: () => void, delay?: number, subs?: FSub) => {
      if (!subs(FSubType.CHECK) && work) {
        buffer.push({ work, due: delay + time, subs });
        updateSort();
      }
      return time;
    },
    flush() {
      while (buffer.length > 0) {
        const { due, work } = buffer.shift();
        time = due;
        work();
      }
    },
    now() {
      return time;
    }
  };
}

interface VirtualWork {
  work: () => void;
  due: number;
  subs: FSub;
}