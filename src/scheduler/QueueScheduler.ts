import {Scheduler} from '../Scheduler';
import {QueueAction} from './QueueAction';
import {Subscription} from '../Subscription';
import {FutureAction} from './FutureAction';
import {Action} from './Action';

export class QueueScheduler implements Scheduler {
  public active: boolean = false;
  public actions: QueueAction<any>[] = [];
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
    for (let action; action = actions.shift(); ) {
      action.execute();
    }
    this.active = false;
  }

  schedule<T>(work: (x?: any) => Subscription | void, delay: number = 0, state?: any): Subscription {
    return (delay <= 0) ?
      this.scheduleNow(work, state) :
      this.scheduleLater(work, delay, state);
  }

  scheduleNow<T>(work: (x?: any) => Subscription | void, state?: any): Action {
    return new QueueAction(this, work).schedule(state);
  }

  scheduleLater<T>(work: (x?: any) => Subscription | void, delay: number, state?: any): Action {
    return new FutureAction(this, work).schedule(state, delay);
  }
}
