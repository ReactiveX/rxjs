import { Action } from '../scheduler/Action';
import { async } from '../scheduler/async';
import { isDate } from '../util/isDate';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';
import { TimeoutError } from '../util/TimeoutError';

/**
 * @param due
 * @param errorToSend
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method timeout
 * @owner Observable
 */
export function timeout<T>(this: Observable<T>, due: number | Date,
                           errorToSend: any = null,
                           scheduler: Scheduler = async): Observable<T> {
  const absoluteTimeout = isDate(due);
  const waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(<number>due);
  const error = errorToSend || new TimeoutError();
  return this.lift(new TimeoutOperator(waitFor, absoluteTimeout, error, scheduler));
}

class TimeoutOperator<T> implements Operator<T, T> {
  constructor(private waitFor: number,
              private absoluteTimeout: boolean,
              private errorToSend: any,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source._subscribe(new TimeoutSubscriber<T>(
      subscriber, this.absoluteTimeout, this.waitFor, this.errorToSend, this.scheduler
    ));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TimeoutSubscriber<T> extends Subscriber<T> {

  private action: Action<TimeoutSubscriber<T>> = null;

  constructor(destination: Subscriber<T>,
              private absoluteTimeout: boolean,
              private waitFor: number,
              private errorToSend: any,
              private scheduler: Scheduler) {
    super(destination);
    this.scheduleTimeout();
  }

  private static dispatchTimeout<T>(subscriber: TimeoutSubscriber<T>): void {
    subscriber.error(subscriber.errorToSend);
  }

  private scheduleTimeout(): void {
    const { action } = this;
    if (action) {
      // Recycle the action if we've already scheduled one. All the production
      // Scheduler Actions mutate their state/delay time and return themeselves.
      // VirtualActions are immutable, so they create and return a clone. In this
      // case, we need to set the action reference to the most recent VirtualAction,
      // to ensure that's the one we clone from next time.
      this.action = (<Action<TimeoutSubscriber<T>>> action.schedule(this, this.waitFor));
    } else {
      this.add(this.action = (<Action<TimeoutSubscriber<T>>> this.scheduler.schedule(
        TimeoutSubscriber.dispatchTimeout, this.waitFor, this
      )));
    }
  }

  protected _next(value: T): void {
    if (!this.absoluteTimeout) {
      this.scheduleTimeout();
    }
    super._next(value);
  }

  protected _unsubscribe() {
    this.action = null;
    this.scheduler = null;
    this.errorToSend = null;
  }
}
