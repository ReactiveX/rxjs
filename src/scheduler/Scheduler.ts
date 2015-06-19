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
    if (delay <= 0) {
      return this.scheduleNow(state, work);
    } else {
      return this.scheduleLater(state, work, delay);
    }
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
    return new ScheduledAction(this, state, work);
  }
  
  scheduleLater(state:any, work:Function, delay:number) {
    return new FutureScheduledAction(this, state, work, delay);
  }
}