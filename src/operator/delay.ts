import {asap} from '../scheduler/asap';
import {isDate} from '../util/isDate';
import {Operator} from '../Operator';
import {Scheduler} from '../Scheduler';
import {Subscriber} from '../Subscriber';
import {Notification} from '../Notification';
import {Observable} from '../Observable';

/**
 * Returns an Observable that delays the emission of items from the source Observable
 * by a given timeout or until a given Date.
 * @param {number|Date} delay the timeout value or date until which the emission of the source items is delayed.
 * @param {Scheduler} [scheduler] the Scheduler to use for managing the timers that handle the timeout for each item.
 * @returns {Observable} an Observable that delays the emissions of the source Observable by the specified timeout or Date.
 */
export function delay<T>(delay: number|Date,
                         scheduler: Scheduler = asap): Observable<T> {
  const absoluteDelay = isDate(delay);
  const delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(<number>delay);
  return this.lift(new DelayOperator(delayFor, scheduler));
}

class DelayOperator<T> implements Operator<T, T> {
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

  private static dispatch(state: any): void {
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
    const message = new DelayMessage(scheduler.now() + this.delay, notification);
    this.queue.push(message);

    if (this.active === false) {
      this._schedule(scheduler);
    }
  }

  protected _next(value: T) {
    this.scheduleNotification(Notification.createNext(value));
  }

  protected _error(err: any) {
    this.errored = true;
    this.queue = [];
    this.destination.error(err);
  }

  protected _complete() {
    this.scheduleNotification(Notification.createComplete());
  }
}

class DelayMessage<T> {
  constructor(private time: number,
              private notification: any) {
  }
}
