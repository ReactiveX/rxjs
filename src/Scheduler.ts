import isNumeric from './util/isNumeric';
import Observer from './Observer';
import Immediate from './util/Immediate';
import SerialSubscription from './SerialSubscription';

interface Scheduler {
  async:boolean;
  active:boolean;
  scheduled:boolean;
  actions:Array<any>;
  head:any;
  tail:any;
  schedule(delay:number,state:any,work:Function)
}

var Scheduler:Scheduler = {
  async:true,
  active:false,
  scheduled:false,
  actions:[],  
  head:null,
  tail:null,
  schedule(delay:number, state:any, work:Function) {
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
  },
  
}

function scheduleNow(scheduler:Scheduler, state:any, work:Function) {
    return new ScheduledAction(scheduler, state, work);
}

function scheduleNext(scheduler:Scheduler, state:any, work:Function) {
    return Boolean(scheduler.scheduled) ?
        new ScheduledAction(scheduler, state, work)    :
        new NextScheduledAction(scheduler, state, work);
}

function scheduleLater(scheduler:Scheduler, state:any, work:Function, delay:number) {
    return new FutureScheduledAction(scheduler, state, work, delay);
}

function flush(scheduler:Scheduler, actions:Array<any>):void {
    if (!Boolean(scheduler.active)) {
        scheduler.active = true;
        var action;
        while(action = actions.shift()) {
            action.execute();
        };
        scheduler.head = void 0;
        scheduler.active = false;
    }
}

function ScheduledAction(scheduler, state, work) {
    this.scheduler = scheduler;
    this.work = work;
    this.unsubscribed = false;
    this.schedule(state);
}

ScheduledAction.prototype = Object.create(SerialSubscription.prototype);

function scheduleAction(state) {
    var scheduler = this.scheduler;
    var actions = scheduler.actions;
    this.state = state;
    actions.push(this);
    flush(scheduler, actions);
    return this;
};


ScheduledAction.prototype.schedule = scheduleAction;

ScheduledAction.prototype.reschedule = function reschedule(state) {
    return this.schedule(state);
};

ScheduledAction.prototype.execute = function executeScheduledAction() {
    if (this.unsubscribed) {
        throw new Error("How did did we execute a canceled ScheduledAction?");
    }
    this.add(this.work(this.state));
};

function unsubscribeScheduledAction() {
    var actions = this.scheduler.actions;
    var index = actions.indexOf(this);
    if(index !== -1) {
        actions.splice(index, 1);
    }
    this.work = void 0;
    this.state = void 0;
    this.scheduler = void 0;
};

ScheduledAction.prototype._unsubscribe = unsubscribeScheduledAction;

function NextScheduledAction(scheduler, state, work) {
    ScheduledAction.call(this, scheduler, state, work);
}

NextScheduledAction.prototype = Object.create(ScheduledAction.prototype);

NextScheduledAction.prototype.schedule = function scheduleNextAction(state) {
    var self = this;
    var scheduler = this.scheduler;
    this.state = state;
    scheduler.actions.push(this);
    if (!Boolean(scheduler.scheduled)) {
        scheduler.active = true;
        scheduler.scheduled = true;
        this.id = Immediate.setImmediate(function () {
            self.id = void 0;
            scheduler.active = false;
            scheduler.scheduled = false;
            flush(scheduler, scheduler.actions);
        });
    }
};

NextScheduledAction.prototype._unsubscribe = function unsubscribeNextScheduledAction() {
    unsubscribeScheduledAction.call(this);
    var scheduler = this.scheduler;
    if(scheduler.actions.length === 0) {
        scheduler.active = false;
        scheduler.scheduled = false;
        var id = this.id;
        if(id) {
            this.id = void 0;
            Immediate.clearImmediate(id);
        }
    }
};

function FutureScheduledAction(scheduler, state, work, delay) {
    this.delay = delay;
    ScheduledAction.call(this, scheduler, work, state);
}

FutureScheduledAction.prototype = Object.create(ScheduledAction.prototype);

FutureScheduledAction.prototype.schedule = function scheduleFutureAction(state) {
    var self = this;
    var id = this.id;
    var scheduler = this.scheduler;
    if(id != null) {
        this.id = undefined;
        clearTimeout(id);
    }
    this.state = state;
    this.id = setTimeout(function executeFutureAction() {
        self.id = void 0;
        scheduleAction.call(self, self.state);
    }, this.delay);
};

FutureScheduledAction.prototype._unsubscribe = function unsubscribeFutureScheduledAction() {
    unsubscribeScheduledAction.call(this);
    var id = this.id;
    if(id != null) {
        this.id = void 0;
        clearTimeout(id);
    }
}

export default Scheduler;