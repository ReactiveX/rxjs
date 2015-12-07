import {Operator} from '../Operator';
import {Scheduler} from '../Scheduler';
import {Subscriber} from '../Subscriber';
import {Notification} from '../Notification';
import {queue} from '../scheduler/queue';
import {isDate} from '../util/isDate';

export function delay<T>(delay: number|Date,
                         scheduler: Scheduler = queue) {
  const absoluteDelay = isDate(delay);
  const delayFor = absoluteDelay ? (+delay - scheduler.now()) : <number>delay;
  return this.lift(new DelayOperator(delayFor, scheduler));
}

class DelayOperator<T, R> implements Operator<T, R> {
  constructor(private delay: number,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DelaySubscriber(subscriber, this.delay, this.scheduler);
  }
}

class DelaySubscriber<T> extends Subscriber<T> {
  private queue: Array<any> = [];
  private active: boolean = false;
  private errored: boolean = false;

  private static dispatch(state): void {
    const source = state.source;
    const queue = source.queue;
    const scheduler = state.scheduler;
    const destination = state.destination;

    while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
      queue.shift().notification.observe(destination);
    }

    if (queue.length > 0) {
      const delay = Math.max(0, queue[0].time - scheduler.now());
      (<any> this).schedule(state, delay);
    } else {
      source.active = false;
    }
  }

  constructor(destination: Subscriber<T>,
              private delay: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  private _schedule(scheduler: Scheduler): void {
    this.active = true;
    this.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {
      source: this, destination: this.destination, scheduler: scheduler
    }));
  }

  private scheduleNotification(notification: Notification<any>): void {
    if (this.errored === true) {
      return;
    }

    const scheduler = this.scheduler;
    const message = new DelayMessage<T>(scheduler.now() + this.delay, notification);
    this.queue.push(message);

    if (this.active === false) {
      this._schedule(scheduler);
    }
  }

  _next(value: T) {
    this.scheduleNotification(Notification.createNext(value));
  }

  _error(err) {
    this.errored = true;
    this.queue = [];
    this.destination.error(err);
  }

  _complete() {
    this.scheduleNotification(Notification.createComplete());
  }
}

class DelayMessage<T> {
  constructor(private time: number,
              private notification: any) {
  }
}
