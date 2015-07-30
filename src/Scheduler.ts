import {Immediate} from './util/Immediate';
import Subscription from './Subscription';

export default class Scheduler {
  static immediate: Scheduler;
  static nextTick: Scheduler;
  now(): number {
    return Date.now();
  }
  schedule<T>(delay: number, state: any, work: (x?: any) => Subscription<T> | void): Subscription<T> {
    throw new Error("Scheduler.prototype.schedule not implemented.");
  }
}

export class ImmediateScheduler extends Scheduler {

  actions: Action<any>[] = [];
  active: boolean = false;
  scheduled: boolean = false;

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

export class NextTickScheduler extends ImmediateScheduler {
  scheduleNow<T>(state: any, work: (x?: any) => Subscription<T> | void): Action<T> {
    return (this.scheduled ?
      new Action(this, work) :
      new NextTickAction(this, work)).schedule(state);
  }
}

Scheduler.immediate = new ImmediateScheduler();
Scheduler.nextTick = new NextTickScheduler();

export class Action<T> extends Subscription<T> {

  state: any;

  constructor(public scheduler: ImmediateScheduler,
              public work: (x?: any) => Subscription<T> | void) {
    super();
  }

  schedule(state?:any): Action<T> {
    this.state = state;
    const scheduler = this.scheduler;
    scheduler.actions.push(this);
    scheduler.flush();
    return this;
  }

  execute() {
    if (this.isUnsubscribed) {
      throw new Error("How did did we execute a canceled Action?");
    }
    this.work(this.state);
  }

  unsubscribe() {

    const scheduler = this.scheduler;
    const actions = scheduler.actions;
    const index = actions.indexOf(this);

    this.work = void 0;
    this.state = void 0;
    this.scheduler = void 0;

    if (index !== -1) {
      actions.splice(index, 1);
    }

    super.unsubscribe();
  }
}

export class NextTickAction<T> extends Action<T> {

  id: number;

  schedule(state?:any): Action<T> {

    this.state = state;

    const scheduler = this.scheduler;

    scheduler.actions.push(this);

    if (!scheduler.scheduled) {
      scheduler.scheduled = true;
      this.id = Immediate.setImmediate(() => {
        this.id = void 0;
        this.scheduler.scheduled = false;
        this.scheduler.flush();
      });
    }

    return this;
  }

  unsubscribe() {

    const id = this.id;
    const scheduler = this.scheduler;

    super.unsubscribe();

    if (scheduler.actions.length === 0) {
      scheduler.active = false;
      scheduler.scheduled = false;
      if (id) {
        this.id = void 0;
        Immediate.clearImmediate(id);
      }
    }
  }
}

export class FutureAction<T> extends Action<T> {

  id: number;

  constructor(public scheduler: ImmediateScheduler,
              public work: (x?: any) => Subscription<T> | void,
              public delay: number) {
    super(scheduler, work);
  }

  schedule(state?:any): Action<T> {

    this.state = state;

    const id = this.id;

    if (id != null) {
      this.id = undefined;
      clearTimeout(id);
    }

    const scheduler = this.scheduler;

    this.id = setTimeout(() => {
      this.id = void 0;
      scheduler.actions.push(this);
      scheduler.flush();
    }, this.delay);

    return this;
  }

  unsubscribe() {
    debugger;
    const id = this.id;
    if (id != null) {
      this.id = void 0;
      clearTimeout(id);
    }
    super.unsubscribe();
  }
}
