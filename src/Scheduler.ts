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
  
  schedule(delay, state, work) {
    var argsLen = arguments.length;

    if (argsLen === 2) {
        work = state;
        state = delay;
        delay = 0;
    } else if (argsLen === 1) {
        work = delay;
        state = void 0,
        delay = 0;
    } else if(argsLen === 0) {
        throw new Error("Scheduler.schedule requires an action to schedule.");
    }

    isNumeric(delay) || (delay = 0);

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

function scheduleNow(scheduler, state, work) {
    return new ScheduledAction(scheduler, state, work);
}

function scheduleNext(scheduler, state, work) {
    return Boolean(scheduler.scheduled) ?
        new ScheduledAction(scheduler, state, work)    :
        new NextScheduledAction(scheduler, state, work);
}

function scheduleLater(scheduler, state, work, delay) {
    return new FutureScheduledAction(scheduler, state, work, delay);
}
