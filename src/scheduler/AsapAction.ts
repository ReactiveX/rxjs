import {Action} from './Action';
import {Immediate} from '../util/Immediate';
import {FutureAction} from './FutureAction';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class AsapAction<T> extends FutureAction<T> {

  protected _schedule(state?: T, delay: number = 0): Action<T> {
    if (delay > 0) {
      return super._schedule(state, delay);
    }
    this.delay = delay;
    this.state = state;
    const {scheduler} = this;
    scheduler.actions.push(this);
    if (!scheduler.scheduledId) {
      scheduler.scheduledId = Immediate.setImmediate(() => {
        scheduler.scheduledId = null;
        scheduler.flush();
      });
    }
    return this;
  }

  protected _unsubscribe(): void {

    const {scheduler} = this;
    const {scheduledId, actions} = scheduler;

    super._unsubscribe();

    if (actions.length === 0) {
      scheduler.active = false;
      if (scheduledId != null) {
        scheduler.scheduledId = null;
        Immediate.clearImmediate(scheduledId);
      }
    }
  }
}
