import { Action } from '../scheduler/Action';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { IScheduler } from '../Scheduler';
import { async } from '../scheduler/async';
import { TeardownLogic } from '../Subscription';
import { Observable, ObservableInput } from '../Observable';
import { isDate } from '../util/isDate';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function timeoutWith<T>(this: Observable<T>, due: number | Date, withObservable: ObservableInput<T>, scheduler?: IScheduler): Observable<T>;
export function timeoutWith<T, R>(this: Observable<T>, due: number | Date, withObservable: ObservableInput<R>, scheduler?: IScheduler): Observable<T | R>;
/* tslint:enable:max-line-length */

/**
 * @param due
 * @param withObservable
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method timeoutWith
 * @owner Observable
 */
export function timeoutWith<T, R>(this: Observable<T>, due: number | Date,
                                  withObservable: ObservableInput<R>,
                                  scheduler: IScheduler = async): Observable<T | R> {
  let absoluteTimeout = isDate(due);
  let waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(<number>due);
  return this.lift(new TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler));
}

class TimeoutWithOperator<T> implements Operator<T, T> {
  constructor(private waitFor: number,
              private absoluteTimeout: boolean,
              private withObservable: ObservableInput<any>,
              private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new TimeoutWithSubscriber(
      subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler
    ));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TimeoutWithSubscriber<T, R> extends OuterSubscriber<T, R> {

  private action: Action<TimeoutWithSubscriber<T, R>> = null;

  constructor(destination: Subscriber<T>,
              private absoluteTimeout: boolean,
              private waitFor: number,
              private withObservable: ObservableInput<any>,
              private scheduler: IScheduler) {
    super(destination);
    this.scheduleTimeout();
  }

  private static dispatchTimeout<T, R>(subscriber: TimeoutWithSubscriber<T, R>): void {
    const { withObservable } = subscriber;
    (<any> subscriber)._unsubscribeAndRecycle();
    subscriber.add(subscribeToResult(subscriber, withObservable));
  }

  private scheduleTimeout(): void {
    const { action } = this;
    if (action) {
      // Recycle the action if we've already scheduled one. All the production
      // Scheduler Actions mutate their state/delay time and return themeselves.
      // VirtualActions are immutable, so they create and return a clone. In this
      // case, we need to set the action reference to the most recent VirtualAction,
      // to ensure that's the one we clone from next time.
      this.action = (<Action<TimeoutWithSubscriber<T, R>>> action.schedule(this, this.waitFor));
    } else {
      this.add(this.action = (<Action<TimeoutWithSubscriber<T, R>>> this.scheduler.schedule(
        TimeoutWithSubscriber.dispatchTimeout, this.waitFor, this
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
    this.withObservable = null;
  }
}
