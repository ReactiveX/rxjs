import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';

export class VirtualTimeScheduler implements SchedulerLike {
  private _flushing = false;
  private _actions: VirtualAction[] = [];

  index = -1;
  frame = 0;
  frameTimeFactor = 1;

  constructor(public maxFrames = Number.POSITIVE_INFINITY) {}

  schedule<T>(work: (state: T) => void, delay = 0, state = undefined as T, subs?: Subscription): Subscription {
    subs = subs || new Subscription();
    const actions = this._actions;
    const action = {
      index: this.index++,
      delay: this.frame + delay,
      work,
      state,
      subs,
    };
    subs.add(() => {
      const i = actions.indexOf(action);
      if (i >= 0) {
        actions.splice(i, 1);
      }
    });
    actions.push(action);
    actions.sort(sortActions);
    return subs;
  }

  now() {
    return this.frame;
  }

  flush() {
    if (!this._flushing) {
      const actions = this._actions;
      this._flushing = true;
      let action: VirtualAction;
      while (actions.length > 0) {

        if (this.frame >= this.maxFrames) {
          break;
        }

        action = actions.shift();

        this.frame = action.delay;

        try {
          action.work(action.state);
        } catch (err) {
          let teardownAction: VirtualAction;
          while (teardownAction = actions.shift()) {
            teardownAction.subs.unsubscribe();
          }
          throw err;
        } finally {
          action.subs.unsubscribe();
        }
      }

      this._flushing = false;
    }
  }
}

interface VirtualAction<T= any> {
  index: number;
  delay: number;
  work: (state: T) => void;
  state: T|undefined;
  subs: Subscription;
}

function sortActions(a: VirtualAction, b: VirtualAction) {
  if (a.delay === b.delay) {
    if (a.index === b.index) {
      return 0;
    } else if (a.index > b.index) {
      return 1;
    } else {
      return -1;
    }
  } else if (a.delay > b.delay) {
    return 1;
  } else {
    return -1;
  }
}
