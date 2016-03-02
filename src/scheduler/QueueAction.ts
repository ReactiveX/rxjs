import {Action} from './Action';
import {FutureAction} from './FutureAction';

export class QueueAction<T> extends FutureAction<T> {
  protected _schedule(state?: T, delay: number = 0): Action {
    if (delay > 0) {
      return super._schedule(state, delay);
    }
    this.delay = delay;
    this.state = state;
    const scheduler = this.scheduler;
    scheduler.actions.push(this);
    scheduler.flush();
    return this;
  }
}
