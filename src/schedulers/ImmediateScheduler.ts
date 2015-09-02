import { Immediate } from '../util/Immediate';
import Scheduler from '../Scheduler';
import Action from './Action';
import Subscription from '../Subscription';
import FutureAction from './FutureAction';

export default class ImmediateScheduler implements Scheduler {
  actions: Action<any>[] = [];
  active: boolean = false;
  scheduled: boolean = false;

  now() {
    return Date.now();
  }  
  
  flush() {
    if (this.active || this.scheduled) {
      return;
    }
    this.active = true;
    const actions = this.actions;
    for (let action; action = actions.shift();) {
      action.execute();
    }
    this.active = false;
  }

  schedule<T>(delay: number, state: any, work: (x?: any) => Subscription<T> | void): Subscription<T> {
    return (delay <= 0) ?
      this.scheduleNow(state, work) :
      this.scheduleLater(state, work, delay);
  }

  scheduleNow<T>(state: any, work: (x?: any) => Subscription<T> | void): Action<T> {
    return new Action(this, work).schedule(state);
  }

  scheduleLater<T>(state: any, work: (x?: any) => Subscription<T> | void, delay: number): Action<T> {
    return new FutureAction(this, work, delay).schedule(state);
  }
}