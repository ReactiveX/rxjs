import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';
import { async } from './async';
import { DEFAULT_NOW } from './common';

interface Task {
  work: (state: any, reschedule: (nextState: any) => void) => void;
  state: any;
  subscription: Subscription;
}

let _currentQueue: Task[] = [];
let _nextQueue: Task[] = [];

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
  schedule<S>(work: (state: S, reschedule: (nextState: S) => void) => void, delay = 0, state?: S): Subscription {
    const subscription = new Subscription();
    if (delay > 0) {
      subscription.add(
        async.schedule(() => {
          subscription.add(this.schedule(work, 0, state));
        }, delay)
      );
    } else {
      // Start the animation frame loop if it's not already going
      startAnimationFrameLoop();

      // Push a task to execute onto the queue.
      const task = { work, state, subscription };
      _nextQueue.push(task);

      // Set up the teardown
      subscription.add(() => {
        // I might be in the currently flushing queue.
        let index = _currentQueue.indexOf(task);
        if (index >= 0) {
          _currentQueue.splice(index, 1);
        }

        // *OR* It might be in the queue that hasn't hit a frame to start flushing yet.
        index = _nextQueue.indexOf(task);
        if (index >= 0) {
          _nextQueue.splice(index, 1);
        }

        // If the current animation frame queue is empty, AND the overall queue is empty, stop the animation frame loop
        if (_currentQueue.length === 0 && _nextQueue.length === 0) {
          stopAnimationFrameLoop();
        }
      });
    }
    return subscription;
  },

  now: DEFAULT_NOW,
};

let flushing = false;

/** Moves to the next animation task queue and flushes it */
function flush() {
  if (!flushing) {
    flushing = true;

    // Move to the next queue
    _currentQueue = _nextQueue;

    // Start a new queue for newly scheduled or rescheduled items
    _nextQueue = [];

    // process the tasks on this queue FIFO.
    while (_currentQueue.length > 0) {
      const task = _currentQueue.shift();

      let rescheduled = false;
      const reschedule = (nextState: any) => {
        rescheduled = true;
        task.state = nextState;
        // If the task was rescheduled, push it onto the next queue
        // which will be processed on the next animationFrame
        _nextQueue.push(task);
      };

      task.work(task.state, reschedule);
      if (!rescheduled)  {
        // Otherwise teardown the task. (Set up above)
        task.subscription.unsubscribe();
      }
    }
    flushing = false;
  }
}

let _id = -1;

/** Starts a requestAnimationFrame loop, will run {@link flush} on each frame*/
function startAnimationFrameLoop() {
  _id = requestAnimationFrame(animate);
}

function animate() {
  flush();
  _id = requestAnimationFrame(animate);
}

/** Stops the requesAnimationFrame loop */
function stopAnimationFrameLoop() {
  cancelAnimationFrame(_id);
  _id = -1;
}
