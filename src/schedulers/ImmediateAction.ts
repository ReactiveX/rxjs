import Subscription from '../Subscription';
import Scheduler from '../Scheduler';
import Action from './Action';

export default class ImmediateAction<T> extends Subscription<T> implements Action {

  state: any;

  constructor(public scheduler: Scheduler,
              public work: (x?: any) => Subscription<T> | void) {
    super();
  }

  schedule(state?: any): Action {
    if (this.isUnsubscribed) {
      return this;
    }
    
    this.state = state;
    const scheduler = this.scheduler;
    scheduler.actions.push(this);
    scheduler.flush();
    return this;
  }

  execute() {
    if (this.isUnsubscribed) {
      throw new Error("How did did we execute a canceled Action?");
    }
    this.work(this.state);
  }

  unsubscribe() {

    const scheduler = this.scheduler;
    const actions = scheduler.actions;
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