import {Immediate} from '../util/Immediate';
import {QueueAction} from './QueueAction';
import {Action} from './Action';

export class AsapAction<T> extends QueueAction<T> {
  private id: any;

  schedule(state?: any): Action {
    if (this.isUnsubscribed) {
      return this;
    }

    this.state = state;

    const scheduler = this.scheduler;

    scheduler.actions.push(this);

    if (!scheduler.scheduled) {
      scheduler.scheduled = true;
      this.id = Immediate.setImmediate(() => {
        this.id = null;
        this.scheduler.scheduled = false;
        this.scheduler.flush();
      });
    }

    return this;
  }

  unsubscribe(): void {
    const id = this.id;
    const scheduler = this.scheduler;

    super.unsubscribe();

    if (scheduler.actions.length === 0) {
      scheduler.active = false;
      scheduler.scheduled = false;
    }

    if (id) {
      this.id = null;
      Immediate.clearImmediate(id);
    }
  }
}