import {Immediate} from '../util/Immediate';
import Subscription from '../Subscription';
import ImmediateAction from './ImmediateAction';
import Action from './Action';

export default class NextTickAction<T> extends ImmediateAction<T> {

  id: number;

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
        this.id = void 0;
        this.scheduler.scheduled = false;
        this.scheduler.flush();
      });
    }

    return this;
  }

  unsubscribe() {

    const id = this.id;
    const scheduler = this.scheduler;

    super.unsubscribe();

    if (scheduler.actions.length === 0) {
      scheduler.active = false;
      scheduler.scheduled = false;
      if (id) {
        this.id = void 0;
        Immediate.clearImmediate(id);
      }
    }
  }
}