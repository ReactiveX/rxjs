import {root} from '../util/root';
import {Action} from './Action';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';

export class FutureAction<T> extends Subscription implements Action {

  public id: number;
  public state: T;
  public delay: number;

  constructor(public scheduler: Scheduler,
              public work: (x?: T) => Subscription | void) {
    super();
  }

  execute() {
    if (this.isUnsubscribed) {
      throw new Error('How did did we execute a canceled Action?');
    }
    this.work(this.state);
  }

  schedule(state?: T, delay: number = 0): Action {
    if (this.isUnsubscribed) {
      return this;
    }
    return this._schedule(state, delay);
  }

  protected _schedule(state?: T, delay: number = 0): Action {

    this.delay = delay;
    this.state = state;
    const id = this.id;

    if (id != null) {
      this.id = null;
      root.clearTimeout(id);
    }

    this.id = root.setTimeout(() => {
      this.id = null;
      const {scheduler} = this;
      scheduler.actions.push(this);
      scheduler.flush();
    }, delay);

    return this;
  }

  protected _unsubscribe() {

    const {id, scheduler} = this;
    const {actions} = scheduler;
    const index = actions.indexOf(this);

    if (id != null) {
      this.id = null;
      root.clearTimeout(id);
    }

    if (index !== -1) {
      actions.splice(index, 1);
    }

    this.work = null;
    this.state = null;
    this.scheduler = null;
  }
}
