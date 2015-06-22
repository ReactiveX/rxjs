import Immediate from '../util/Immediate';
import SerialSubscription from '../SerialSubscription';
import Subscription from '../Subscription';
import NextTickScheduler from './NextTickScheduler';

import {
  ScheduledAction,
  NextScheduledAction,
  FutureScheduledAction
} from './SchedulerActions';

export default class Scheduler {
  actions:Array<ScheduledAction> = [];
  active:boolean = false;
  scheduled:boolean = false;  
  
  constructor() {
  }
  
  schedule(delay:number, state:any, work:Function):Subscription {
    return (delay <= 0) ? this.scheduleNow(state, work) : this.scheduleLater(state, work, delay);
  }
  
  flush() {
    if (!this.active) {
      this.active = true;
      var action;
      while(action = this.actions.shift()) {
          action.execute();
      };
      this.active = false;
    } 
  }
  
  scheduleNow(state:any, work:Function):ScheduledAction {
    var action = new ScheduledAction(this, state, work);
    action.schedule();
    return action;
  }
  
  scheduleLater(state:any, work:Function, delay:number) {
    var action = new FutureScheduledAction(this, state, work, delay);
    action.schedule();
    return action;
  }
}