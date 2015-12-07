import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';
import {Action} from './Action';
import {QueueAction} from './QueueAction';

export class FutureAction<T> extends QueueAction<T> {

  id: any;
  delay: number;

  constructor(public scheduler: QueueScheduler,
              public work: (x?: any) => Subscription<T> | void) {
    super(scheduler, work);
  }

  schedule(state?: any, delay: number = 0): Action {
    if (this.isUnsubscribed) {
      return this;
    }

    this.delay = delay;
    this.state = state;
    const id = this.id;

    if (id != null) {
      this.id = undefined;
      clearTimeout(id);
    }

    const scheduler = this.scheduler;

    this.id = setTimeout(() => {
      this.id = void 0;
      scheduler.actions.push(this);
      scheduler.flush();
    }, this.delay);

    return this;
  }

  unsubscribe() {
    const id = this.id;
    if (id != null) {
      this.id = void 0;
      clearTimeout(id);
    }
    super.unsubscribe();
  }
}
