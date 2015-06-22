import Scheduler from './Scheduler';
import { NextScheduledAction, ScheduledAction } from './SchedulerActions';
export default class NextTickScheduler extends Scheduler {
    scheduleNow(state, work) {
        var action = this.scheduled ? new ScheduledAction(this, state, work) : new NextScheduledAction(this, state, work);
        action.schedule();
        return action;
    }
}
