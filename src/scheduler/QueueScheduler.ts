import {Scheduler} from '../Scheduler';
import {QueueAction} from './QueueAction';
import {Subscription} from '../Subscription';
import {FutureAction} from './FutureAction';
import {Action} from './Action';

export class QueueScheduler implements Scheduler {
  public active: boolean = false;
  public actions: QueueAction<any>[] = []; // XXX: use `any` to remove type param `T` from `VirtualTimeScheduler`.
  public scheduledId: number = null;

  now() {
    return Date.now();
  }

  flush() {
    if (this.active || this.scheduledId) {
      return;
    }
    this.active = true;
    const actions = this.actions;
    // XXX: use `any` to remove type param `T` from `VirtualTimeScheduler`.
    for (let action: QueueAction<any> = null; action = actions.shift(); ) {
      action.execute();
      if (action.error) {
        this.active = false;
        throw action.error;
      }
    }
    this.active = false;
  }

  schedule<T>(work: (x?: T) => Subscription | void, delay: number = 0, state?: T): Subscription {
    return (delay <= 0) ?
      this.scheduleNow(work, state) :
      this.scheduleLater(work, delay, state);
  }

  scheduleNow<T>(work: (x?: T) => Subscription | void, state?: T): Action<T> {
    return new QueueAction(this, work).schedule(state);
  }

  scheduleLater<T>(work: (x?: T) => Subscription | void, delay: number, state?: T): Action<T> {
    return new FutureAction(this, work).schedule(state, delay);
  }
}
