import { SchedulerLike } from '../types';
import { Subscription } from 'rxjs/Rx';
import { DEFAULT_NOW, __rx_scheduler_overrides__ } from './common';

/**
 *
 * Async Scheduler
 *
 * <span class="informal">Schedule task as if you used setTimeout(task, duration)</span>
 *
 * `async` scheduler schedules tasks asynchronously, by putting them on the JavaScript
 * event loop queue. It is best used to delay tasks in time or to schedule tasks repeating
 * in intervals.
 *
 * If you just want to "defer" task, that is to perform it right after currently
 * executing synchronous code ends (commonly achieved by `setTimeout(deferredTask, 0)`),
 * better choice will be the {@link asapScheduler} scheduler.
 *
 * ## Examples
 * Use async scheduler to delay task
 * ```javascript
 * import { asyncScheduler } from 'rxjs';
 *
 * const task = () => console.log('it works!');
 *
 * asyncScheduler.schedule(task, 2000);
 *
 * // After 2 seconds logs:
 * // "it works!"
 * ```
 */

export const async: SchedulerLike = {
  schedule<S>(work: (state: S) => void, delay = 0, state?: S): Subscription {
    if (__rx_scheduler_overrides__.scheduler) {
      return __rx_scheduler_overrides__.scheduler.schedule(work, delay, state);
    }
    const subscription = new Subscription();
    const id = setTimeout(() => {
      try {
        work(state);
      } finally {
        subscription.unsubscribe();
      }
    }, delay);
    subscription.add(() => clearTimeout(id));
    return subscription;
  },

  now: DEFAULT_NOW,
};
