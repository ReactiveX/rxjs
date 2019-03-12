import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';
import { async } from './async';
import { DEFAULT_NOW } from './common';

interface TaskContext {
  rescheduled: boolean;
  work: (state: any, reschedule: (nextState: any) => void) => void;
  state: any;
  subscription: Subscription;
}

export class QueueScheduler implements SchedulerLike {
  private _queue: (TaskContext | ((nextState: any) => void))[] = [];
  private _flushing = false;

  schedule<S>(work: (state: S, reschedule: (nextState: S) => void) => void, delay = 0, state?: S): Subscription {
    if (delay > 0) {
      return async.schedule(work, delay, state);
    } else {
      const _queue = this._queue;
      const subscription = new Subscription();

      const task = {
        rescheduled: false,
        work,
        state,
        subscription,
      };

      const reschedule = (nextState: any) => {
        task.rescheduled = true;
        task.state = nextState;
        _queue.push(task, reschedule);
      };

      reschedule(state);

      subscription.add(() => {
        const index = _queue.indexOf(task);
        if (index >= 0) {
          _queue.splice(index, 2);
        }
      });

      this._flush();
      return subscription;
    }
  }

  now = DEFAULT_NOW;

  private _flush() {
    if (!this._flushing) {
      this._flushing = true;
      const _queue = this._queue;
      while (_queue.length > 0) {
        const task = _queue.shift() as TaskContext;
        const reschedule = _queue.shift() as (nextState: any) => void;
        const subscription = task.subscription;

        try {
          task.rescheduled = false;
          task.work(task.state, reschedule);
        } catch (err) {
          subscription.unsubscribe();
          this._clean();
          this._flushing = false;
          throw err;
        }

        // check global state to see if we rescheduled
        if (!task.rescheduled) {
          subscription.unsubscribe();
        }
      }
      this._flushing = false;
    }
  }

  /** Cleans up subscriptions in the event of an error flushing the queue */
  private _clean() {
    const copy = this._queue.slice();
    this._queue.length = 0;

    for (let i = 0; i < copy.length; i += 2) {
      (copy[i] as TaskContext).subscription.unsubscribe();
    }
  }

}
