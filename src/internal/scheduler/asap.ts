import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';
import { DEFAULT_NOW, __rx_scheduler_overrides__ } from './common';
import { async } from './async';

const RESOLVED_PROMISE = Promise.resolve();

/**
 *
 * Asap Scheduler
 *
 * <span class="informal">Perform task as fast as it can be performed asynchronously</span>
 *
 * `asap` scheduler behaves the same as {@link asyncScheduler} scheduler when you use it to delay task
 * in time. If however you set delay to `0`, `asap` will wait for current synchronously executing
 * code to end and then it will try to execute given task as fast as possible.
 *
 * `asap` scheduler will do its best to minimize time between end of currently executing code
 * and start of scheduled task. This makes it best candidate for performing so called "deferring".
 * Traditionally this was achieved by calling `setTimeout(deferredTask, 0)`, but that technique involves
 * some (although minimal) unwanted delay.
 *
 * Note that using `asap` scheduler does not necessarily mean that your task will be first to process
 * after currently executing code. In particular, if some task was also scheduled with `asap` before,
 * that task will execute first. That being said, if you need to schedule task asynchronously, but
 * as soon as possible, `asap` scheduler is your best bet.
 *
 * ## Example
 * Compare async and asap scheduler<
 * ```javascript
 * import { asapScheduler, asyncScheduler } from 'rxjs';
 *
 * asyncScheduler.schedule(() => console.log('async')); // scheduling 'async' first...
 * asapScheduler.schedule(() => console.log('asap'));
 *
 * // Logs:
 * // "asap"
 * // "async"
 * // ... but 'asap' goes first!
 * ```
 * @static true
 * @name asap
 * @owner Scheduler
 */
export const asap: SchedulerLike = {
  schedule<S>(work: (state: S) => void, delay = 0, state?: S): Subscription {
    if (__rx_scheduler_overrides__.scheduler) {
      return __rx_scheduler_overrides__.scheduler.schedule(work, delay, state);
    }
    if (delay > 0) {
      return async.schedule(work, delay, state);
    }
    let cancelled = false;
    const subscription = new Subscription(() => cancelled = true);
    RESOLVED_PROMISE.then(() => {
      if (!cancelled) {
        try {
          work(state);
        } finally {
          subscription.unsubscribe();
        }
      }
    });
    return subscription;
  },

  now: DEFAULT_NOW,
};
