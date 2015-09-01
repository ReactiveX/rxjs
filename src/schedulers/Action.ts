import Subscription from '../Subscription';
import ImmediateScheduler from './ImmediateScheduler';

export default class Action<T> extends Subscription<T> {

  state: any;

  constructor(public scheduler: ImmediateScheduler,
              public work: (x?: any) => Subscription<T> | void) {
    super();
  }

  schedule(state?: any): Action<T> {
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