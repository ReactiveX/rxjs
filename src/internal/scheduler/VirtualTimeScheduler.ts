import { SchedulerLike } from '../types';
import { Subscription } from '../Subscription';

export class VirtualTimeScheduler implements SchedulerLike {
  private _flushing = false;
  private _actions: VirtualAction[] = [];

  index = -1;
  frame = 0;
  frameTimeFactor = 1;

  constructor(public maxFrames = Number.POSITIVE_INFINITY) {}

  schedule<S>(work: (state: S, reschedule: (nextState: S) => void) => void, delay = 0, state = undefined as S, subs?: Subscription): Subscription {
    subs = subs || new Subscription();
    const actions = this._actions;
    const action = {
      index: this.index++,
      delay,
      due: this.frame + delay,
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

        this.frame = action.due;

        let rescheduled = false;
        const reschedule = (nextState: any) => {
          rescheduled = true;
          action.state = nextState;
          action.due = action.due + action.delay;
          actions.push(action);
          actions.sort(sortActions);
        };

        try {
          action.work(action.state, reschedule);
        } catch (err) {
          this._clean();
          throw err;
        }
        if (rescheduled) {
          actions.push(action);
        } else {
          action.subs.unsubscribe();
        }
      }

      this._flushing = false;
    }
  }

  private _clean() {
    while (this._actions.length > 0) {
      this._actions.shift().subs.unsubscribe();
    }
  }
}

interface VirtualAction<S = any> {
  index: number;
  /**
   * The scheduled time due (frame of execution)
   */
  due: number;
  /**
   * The original relative time sent via schedule
   */
  delay: number;
  work: (state: S, reschedule: (nextState: S) => void) => void;
  state: S|undefined;
  subs: Subscription;
}

function sortActions(a: VirtualAction, b: VirtualAction) {
  if (a.due === b.due) {
    if (a.index === b.index) {
      return 0;
    } else if (a.index > b.index) {
      return 1;
    } else {
      return -1;
    }
  } else if (a.due > b.due) {
    return 1;
  } else {
    return -1;
  }
}
