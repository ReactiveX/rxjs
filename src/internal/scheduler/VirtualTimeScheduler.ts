import { SchedulerLike } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export interface VirtualTimeSchedulerCtor {
  new (maxFrames?: number): VirtualTimeScheduler;
}

export interface VirtualTimeScheduler extends SchedulerLike {
  frameTimeFactor: number;
  index: number;
  maxFrames: number;
  flush(): void;
  frame: number;
}

interface VirtualAction<T=any> {
  index: number;
  delay: number;
  work: (state: T) => void;
  state: T|undefined;
  subs: Subscription;
}

function VirtualTimeSchedulerImpl(this: any, maxFrames = Number.POSITIVE_INFINITY) {
  this._actions = [];
  this._flushing = false;
  this.maxFrames = Number.POSITIVE_INFINITY;
  this.frame = 0;
  this.frameTimeFactor = 1;
  this.index = -1;
}

const proto = VirtualTimeSchedulerImpl.prototype;

proto.schedule = function<T>(this: any, work: (state: T) => void, delay = 0, state = undefined as T, subs?: Subscription): Subscription {
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
};

proto.now = function () {
  return this.frame;
};

proto.flush = function (this: any) {
  if (!this._flushing) {
    const actions = this._actions;

    const maxFrames = this.maxFrames;
    this._flushing = true;
    let action: VirtualAction;
    while (action = actions.shift()) {
      // ) && (this.frame = action.delay) <= maxFrames

      if (this.frame > action.delay) {
        // skip frames that were scheduled in the past. That shouldn't be possible.
        continue;
      }

      this.frame = action.delay;
      if (this.frame > maxFrames) {
        break;
      }

      try {
        action.work(action.state);
      } catch (err) {
        while(actions.length > 0) {
          actions.shift().subs.unsubscribe();
        }
        throw err;
      }
    }
    actions.length = 0;
    this._flushing = false;
  }
}

export const VirtualTimeScheduler: VirtualTimeSchedulerCtor = VirtualTimeSchedulerImpl as any;

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
