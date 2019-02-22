import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';
import { async } from './async';
import { DEFAULT_NOW } from './common';

export class QueueScheduler implements SchedulerLike {
  private _queue: any[] = [];
  private _flushing = false;

  schedule<S>(work: (state: S) => void, delay = 0, state?: S): Subscription {
    if (delay > 0) {
      return async.schedule(work, delay, state);
    } else {
      const _queue = this._queue;
      const subscription = new Subscription();
      subscription.add(() => {
        const index = _queue.indexOf(subscription);
        if (index >= 0) {
          _queue.splice(index - 2, 3);
        }
      });
      _queue.push(work, state, subscription);
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
        const work = _queue.shift() as (state: any) => void;
        const state = _queue.shift();
        const subs = _queue.shift() as Subscription;
        try {
          work(state);
        } catch (err) {
          // clean up subscriptions
          const copy = _queue.slice();
          _queue.length = 0;
          this._flushing = false;
          for (let i = 2; i < copy.length; i += 3) {
            (copy[i] as Subscription).unsubscribe();
          }
          throw err;
        } finally {
          subs.unsubscribe();
        }
      }
      this._flushing = false;
    }
  }
}