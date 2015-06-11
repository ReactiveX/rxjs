import isNumeric from './util/isNumeric';
import Observer from './Observer';
import Immediate from './util/Immediate';
import SerialSubscription from './SerialSubscription';
import {
  ScheduledAction,
  NextScheduledAction,
  FutureScheduledAction
} from './SchedulerActions';

export default class Scheduler {
  actions:Array<ScheduledAction> = [];
  async:boolean = false;
  active:boolean = false;
  scheduled:boolean = false;  
  
  static immediate:Scheduler = new Scheduler(false);
  static nextTick:Scheduler = new Scheduler(true);
  
  constructor(async:boolean=false) {
    this.async = async;
  }
  
  schedule(delay:number, state:any, work:Function):ScheduledAction {
   if (delay <= 0) {
        if (Boolean(this.async)) {
            return scheduleNext(this, state, work);
        } else {
            return scheduleNow(this, state, work);
        }
    } else {
        return scheduleLater(this, state, work, delay);
    }
  }
}

function scheduleNow(scheduler:Scheduler, state:any, work:Function):ScheduledAction {
    return new ScheduledAction(scheduler, state, work);
}

function scheduleNext(scheduler:Scheduler, state:any, work:Function):ScheduledAction {
    return Boolean(scheduler.scheduled) ?
        new ScheduledAction(scheduler, state, work)    :
        new NextScheduledAction(scheduler, state, work);
}

function scheduleLater(scheduler:Scheduler, state:any, work:Function, delay:number):FutureScheduledAction {
    return new FutureScheduledAction(scheduler, state, work, delay);
}
