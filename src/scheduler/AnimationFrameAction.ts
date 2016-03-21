import {Action} from './Action';
import {FutureAction} from './FutureAction';
import {AnimationFrame} from '../util/AnimationFrame';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class AnimationFrameAction<T> extends FutureAction<T> {

  protected _schedule(state?: T, delay: number = 0): Action<T> {
    if (delay > 0) {
      return super._schedule(state, delay);
    }
    this.delay = delay;
    this.state = state;
    const {scheduler} = this;
    scheduler.actions.push(this);
    if (!scheduler.scheduledId) {
      scheduler.scheduledId = AnimationFrame.requestAnimationFrame(() => {
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
        AnimationFrame.cancelAnimationFrame(scheduledId);
      }
    }
  }
}
