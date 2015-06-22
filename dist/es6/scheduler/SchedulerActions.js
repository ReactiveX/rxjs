import SerialSubscription from '../SerialSubscription';
import Immediate from '../util/Immediate';
import Subscription from '../Subscription';
export class ScheduledAction extends SerialSubscription {
    constructor(scheduler, state, work) {
        super(null);
        this.scheduler = scheduler;
        this.work = work;
        this.state = state;
    }
    schedule() {
        var scheduler = this.scheduler;
        var actions = scheduler.actions;
        actions.push(this);
        scheduler.flush();
        return this;
    }
    execute() {
        if (this.unsubscribed) {
            throw new Error("How did did we execute a canceled ScheduledAction?");
        }
        this.add(Subscription.from(this.work(this.state), this.observer));
    }
    unsubscribe() {
        super.unsubscribe();
        var actions = this.scheduler.actions;
        var index = Array.isArray(actions) ? actions.indexOf(this) : -1;
        if (index !== -1) {
            actions.splice(index, 1);
        }
        this.work = void 0;
        this.state = void 0;
        this.scheduler = void 0;
    }
}
export class NextScheduledAction extends ScheduledAction {
    schedule() {
        var self = this;
        var scheduler = this.scheduler;
        scheduler.actions.push(this);
        if (!scheduler.scheduled) {
            scheduler.active = true;
            scheduler.scheduled = true;
            this.id = Immediate.setImmediate(function () {
                self.id = void 0;
                scheduler.active = false;
                scheduler.scheduled = false;
                scheduler.flush();
            });
        }
        return this;
    }
    unsubscribe() {
        var scheduler = this.scheduler;
        if (scheduler.actions.length === 0) {
            scheduler.active = false;
            scheduler.scheduled = false;
            var id = this.id;
            if (id) {
                this.id = void 0;
                Immediate.clearImmediate(id);
            }
        }
        super.unsubscribe();
    }
}
export class FutureScheduledAction extends ScheduledAction {
    constructor(scheduler, state, work, delay) {
        super(scheduler, state, work);
        this.delay = delay;
    }
    schedule() {
        var self = this;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = undefined;
            clearTimeout(id);
        }
        var scheduleAction = super.schedule;
        this.id = setTimeout(function executeFutureAction() {
            self.id = void 0;
            scheduleAction.call(self, self.state);
        }, this.delay);
        return this;
    }
    unsubscribe() {
        var id = this.id;
        if (id != null) {
            this.id = void 0;
            clearTimeout(id);
        }
        super.unsubscribe();
    }
}
