import { ScheduledAction, FutureScheduledAction } from './SchedulerActions';
export default class Scheduler {
    constructor() {
        this.actions = [];
        this.active = false;
        this.scheduled = false;
    }
    schedule(delay, state, work) {
        return (delay <= 0) ? this.scheduleNow(state, work) : this.scheduleLater(state, work, delay);
    }
    flush() {
        if (!this.active) {
            this.active = true;
            var action;
            while (action = this.actions.shift()) {
                action.execute();
            }
            ;
            this.active = false;
        }
    }
    scheduleNow(state, work) {
        var action = new ScheduledAction(this, state, work);
        action.schedule();
        return action;
    }
    scheduleLater(state, work, delay) {
        var action = new FutureScheduledAction(this, state, work, delay);
        action.schedule();
        return action;
    }
}
