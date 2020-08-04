import { Scheduler } from '../Scheduler';
import { Action } from './Action';
import { AsyncAction } from './AsyncAction';

export class AsyncScheduler extends Scheduler {
  public actions: Array<AsyncAction<any>> = [];
  /**
   * A flag to indicate whether the Scheduler is currently executing a batch of
   * queued actions.
   * @type {boolean}
   * @deprecated internal use only
   */
  public active: boolean = false;
  /**
   * An internal ID used to track the latest asynchronous task such as those
   * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
   * others.
   * @type {any}
   * @deprecated internal use only
   */
  public scheduled: any = undefined;

  constructor(SchedulerAction: typeof Action, now: () => number = Scheduler.now) {
    super(SchedulerAction, now);
  }

  public flush(action: AsyncAction<any>): void {

    const {actions} = this;

    if (this.active) {
      actions.push(action);
      return;
    }

    let error: any;
    this.active = true;

    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift()!); // exhaust the scheduler queue

    this.active = false;

    if (error) {
      while (action = actions.shift()!) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}
