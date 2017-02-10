import { Scheduler } from '../Scheduler';
import { AsyncAction } from './AsyncAction';

export class AsyncScheduler extends Scheduler {
  public actions: Array<AsyncAction<any>> = [];
  /**
   * A flag to indicate whether the Scheduler is currently executing a batch of
   * queued actions.
   * @type {boolean}
   */
  public active: boolean = false;
  /**
   * An internal ID used to track the latest asynchronous task such as those
   * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
   * others.
   * @type {any}
   */
  public scheduled: any = undefined;

  public flush(action: AsyncAction<any>): void {
    const {actions} = this;

    if (this.active) {
      actions.push(action);
      return;
    }

    let error: any;
    this.active = true;

    let currentAction: AsyncAction<any> | undefined = action;

    do {
      if (error = currentAction.execute(currentAction.state, currentAction.delay)) {
        break;
      }
    } while (currentAction = actions.shift()); // exhaust the scheduler queue

    this.active = false;

    if (error) {
      while (currentAction = actions.shift()) {
        currentAction.unsubscribe();
      }
      throw error;
    }
  }
}
