import { SchedulerLike } from '../types';
import { Subscription } from 'rxjs/Rx';
import { async } from 'rxjs/scheduler/async';
import { DEFAULT_NOW } from './common';

let _animationFrameId = -1;
const _queue: any[] = [];

/**
 *
 * Animation Frame Scheduler
 *
 * <span class="informal">Perform task when `window.requestAnimationFrame` would fire</span>
 *
 * When `animationFrame` scheduler is used with delay, it will fall back to {@link asyncScheduler} scheduler
 * behaviour.
 *
 * Without delay, `animationFrame` scheduler can be used to create smooth browser animations.
 * It makes sure scheduled task will happen just before next browser content repaint,
 * thus performing animations as efficiently as possible.
 *
 * ## Example
 * Schedule div height animation
 * ```ts
 * // html: <div style="background: #0ff;"></div>
 * import { animationFrameScheduler } from 'rxjs';
 *
 * const div = document.querySelector('div');
 *
 * function animate({ height, div }) {
 *  animationFrameScheduler.schedule(animate, 0, { height, div });
 * }
 *
 * animationFrameScheduler.schedule(animate, 0, { height: 0, div });
 *
 * // You will see a div element growing in height
 * ```
 *
 * @static true
 * @name animationFrame
 * @owner Scheduler
 */
export const animationFrame: SchedulerLike = {
  schedule<S>(work: (state: S) => void, delay = 0, state?: S): Subscription {
    const subscription = new Subscription();
    if (delay > 0) {
       subscription.add(
         async.schedule(() => {
           subscription.add(this.schedule(work, 0, state));
         }, delay)
       );
    } else {
      _queue.push(work, state, subscription);
      if (_animationFrameId === -1) {
        _animationFrameId = requestAnimationFrame(flushQueue);
      }
      subscription.add(() => {
        const index = _queue.indexOf(subscription);
        if (index >= 0) {
          _queue.splice(index - 2, 3);
        }
        if (_queue.length === 0) {
          _animationFrameId = -1;
          cancelAnimationFrame(_animationFrameId);
        }
      });
    }
    return subscription;
  },

  now: DEFAULT_NOW,
};

function flushQueue() {
  try {
    while (_queue.length > 0) {
      const work = _queue.shift() as (state: any) => void;
      const state = _queue.shift();
      const subscription = _queue.shift() as Subscription;
      try {
        work(state);
      } finally {
        subscription.unsubscribe();
      }
    }
  } finally {
    // clean up if necessary
    if (_queue.length > 0) {
      const copy = _queue.slice();
      _queue.length = 0;
      for (let i = 2; i < copy.length; i += 3) {
        (copy[i] as Subscription).unsubscribe();
      }
    }
    _animationFrameId = -1;
  }
}