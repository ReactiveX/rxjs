import { ScheduledAction, FutureScheduledAction } from './SchedulerActions';
export default class Scheduler {
    constructor() {
        this.actions = [];
        this.active = false;
        this.scheduled = false;
    }
    schedule(delay, state, work) {
        if (delay <= 0) {
            return this.scheduleNow(state, work);
        }
        else {
            return this.scheduleLater(state, work, delay);
        }
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
        return new ScheduledAction(this, state, work);
    }
    scheduleLater(state, work, delay) {
        return new FutureScheduledAction(this, state, work, delay);
    }
}
