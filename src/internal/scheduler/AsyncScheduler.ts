import { Scheduler } from '../Scheduler';
import { Action } from './Action';
import { AsyncAction } from './AsyncAction';
import { reportUnhandledError } from '../util/reportUnhandledError';
import { TimerHandle } from './timerHandle';

export class AsyncScheduler extends Scheduler {
  public actions: Array<AsyncAction<any>> = [];
  /**
   * A flag to indicate whether the Scheduler is currently executing a batch of
   * queued actions.
   * @internal
   */
  public _active: boolean = false;
  /**
   * An internal ID used to track the latest asynchronous task such as those
   * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
   * others.
   * @internal
   */
  public _scheduled: TimerHandle | undefined;

  constructor(SchedulerAction: typeof Action, now: () => number = Scheduler.now) {
    super(SchedulerAction, now);
  }

  public flush(action: AsyncAction<any>): void {
    const { actions } = this;

    if (this._active) {
      actions.push(action);
      return;
    }

    let error: any;
    this._active = true;

    do {
      if ((error = action.execute(action.state, action.delay))) {
        // Report the error asynchronously so it doesn't tear down the
        // synchronous subscriber chain (e.g. observeOn(queueScheduler)).
        // The erroring action already unsubscribed itself in _execute().
        // Continue flushing remaining actions — they are independent
        // operations that should not be affected by a sibling's error.
        reportUnhandledError(error);
        error = null;
      }
    } while ((action = actions.shift()!)); // exhaust the scheduler queue

    this._active = false;
  }
}
