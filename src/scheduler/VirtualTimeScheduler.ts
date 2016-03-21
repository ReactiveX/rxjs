import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';
import {Action} from './Action';

export class VirtualTimeScheduler implements Scheduler {
  actions: Action<any>[] = []; // XXX: use `any` to remove type param `T` from `VirtualTimeScheduler`.
  active: boolean = false;
  scheduledId: number = null;
  index: number = 0;
  sorted: boolean = false;
  frame: number = 0;
  maxFrames: number = 750;

  protected static frameTimeFactor: number = 10;

  now() {
    return this.frame;
  }

  flush() {
    const actions = this.actions;
    const maxFrames = this.maxFrames;
    while (actions.length > 0) {
      let action = actions.shift();
      this.frame = action.delay;
      if (this.frame <= maxFrames) {
        action.execute();
        if (action.error) {
          actions.length = 0;
          this.frame = 0;
          throw action.error;
        }
      } else {
        break;
      }
    }
    actions.length = 0;
    this.frame = 0;
  }

  addAction<T>(action: Action<T>): void {
    const actions: Action<T>[] = this.actions;

    actions.push(action);

    actions.sort((a: VirtualAction<T>, b: VirtualAction<T>) => {
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
    });
  }

  schedule<T>(work: (x?: T) => Subscription | void, delay: number = 0, state?: T): Subscription {
    this.sorted = false;
    return new VirtualAction(this, work, this.index++).schedule(state, delay);
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class VirtualAction<T> extends Subscription implements Action<T> {
  state: T;
  delay: number;
  calls = 0;
  error: any;

  constructor(public scheduler: VirtualTimeScheduler,
              public work: (x?: T) => Subscription | void,
              public index: number) {
    super();
  }

  schedule(state?: T, delay: number = 0): VirtualAction<T> {
    if (this.isUnsubscribed) {
      return this;
    }
    const scheduler = this.scheduler;
    let action: Action<T> = null;
    if (this.calls++ === 0) {
      // the action is not being rescheduled.
      action = this;
    } else {
      // the action is being rescheduled, and we can't mutate the one in the actions list
      // in the scheduler, so we'll create a new one.
      action = new VirtualAction(scheduler, this.work, scheduler.index += 1);
      this.add(action);
    }
    action.state = state;
    action.delay = scheduler.frame + delay;
    scheduler.addAction(action);
    return this;
  }

  execute() {
    if (this.isUnsubscribed) {
      throw new Error('How did did we execute a canceled Action?');
    }
    this.work(this.state);
  }

  unsubscribe() {
    const actions = this.scheduler.actions;
    const index = actions.indexOf(this);

    this.work = void 0;
    this.state = void 0;
    this.scheduler = void 0;

    if (index !== -1) {
      actions.splice(index, 1);
    }

    super.unsubscribe();
  }
}
