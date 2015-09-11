import Operator from '../Operator';
import Observer from '../Observer';
import Scheduler from '../Scheduler';
import Subscriber from '../Subscriber';
import Notification from '../Notification';
import immediate from '../schedulers/immediate';

export default function delay<T>(delay: number, scheduler: Scheduler = immediate) {
  return this.lift(new DelayOperator(delay, scheduler));
}

class DelayOperator<T, R> implements Operator<T, R> {

  delay: number;
  scheduler: Scheduler;

  constructor(delay: number, scheduler: Scheduler) {
    this.delay = delay;
    this.scheduler = scheduler;
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DelaySubscriber(subscriber, this.delay, this.scheduler);
  }
}

class DelaySubscriber<T> extends Subscriber<T> {

  protected delay: number;
  protected queue: Array<any>=[];
  protected scheduler: Scheduler;
  protected active: boolean = false;
  protected errored: boolean = false;

  static dispatch(state) {
    const source = state.source;
    const queue = source.queue;
    const scheduler = state.scheduler;
    const destination = state.destination;
    while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
      queue.shift().notification.observe(destination);
    }
    if (queue.length > 0) {
      let delay = Math.max(0, queue[0].time - scheduler.now());
      (<any> this).schedule(state, delay);
    } else {
      source.active = false;
    }
  }

  constructor(destination: Observer<T>, delay: number, scheduler: Scheduler) {
    super(destination);
    this.delay = delay;
    this.scheduler = scheduler;
  }

  _next(x) {
    if (this.errored) {
      return;
    }
    const scheduler = this.scheduler;
    this.queue.push(new DelayMessage<T>(scheduler.now() + this.delay, Notification.createNext(x)));
    if (this.active === false) {
      this._schedule(scheduler);
    }
  }

  _error(e) {
    const scheduler = this.scheduler;
    this.errored = true;
    this.queue = [new DelayMessage<T>(scheduler.now() + this.delay, Notification.createError(e))];
    if (this.active === false) {
      this._schedule(scheduler);
    }
  }

  _complete() {
    if (this.errored) {
      return;
    }
    const scheduler = this.scheduler;
    this.queue.push(new DelayMessage<T>(scheduler.now() + this.delay, Notification.createComplete()));
    if (this.active === false) {
      this._schedule(scheduler);
    }
  }

  _schedule(scheduler) {
    this.active = true;
    this.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {
      source: this, destination: this.destination, scheduler: scheduler
    }));
  }
}

class DelayMessage<T> {
  time: number;
  notification: any;
  constructor(time: number, notification: any) {
    this.time = time;
    this.notification = notification;
  }
}