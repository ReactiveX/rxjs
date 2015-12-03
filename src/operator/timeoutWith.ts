import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {queue} from '../scheduler/queue';
import {Subscription} from '../Subscription';
import {Observable} from '../Observable';
import {isDate} from '../util/isDate';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function timeoutWith<T, R>(due: number | Date,
                                  withObservable: Observable<R>,
                                  scheduler: Scheduler = queue): Observable<T> | Observable<R> {
  let absoluteTimeout = isDate(due);
  let waitFor = absoluteTimeout ? (+due - scheduler.now()) : <number>due;
  return this.lift(new TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler));
}

class TimeoutWithOperator<T, R> implements Operator<T, R> {
  constructor(private waitFor: number,
              private absoluteTimeout: boolean,
              private withObservable: Observable<any>,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<R>) {
    return new TimeoutWithSubscriber(
      subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler
    );
  }
}

class TimeoutWithSubscriber<T, R> extends OuterSubscriber<T, R> {
  private timeoutSubscription: Subscription<T> = undefined;
  private index: number = 0;
  private _previousIndex: number = 0;
  get previousIndex(): number {
    return this._previousIndex;
  }
  private _hasCompleted: boolean = false;
  get hasCompleted(): boolean {
    return this._hasCompleted;
  }

  constructor(public destination: Subscriber<T>,
              private absoluteTimeout: boolean,
              private waitFor: number,
              private withObservable: Observable<any>,
              private scheduler: Scheduler) {
    super(null);
    destination.add(this);
    this.scheduleTimeout();
  }

  private static dispatchTimeout(state: any): void {
    const source = state.subscriber;
    const currentIndex = state.index;
    if (!source.hasCompleted && source.previousIndex === currentIndex) {
      source.handleTimeout();
    }
  }

  private scheduleTimeout(): void {
    let currentIndex = this.index;
    const timeoutState = { subscriber: this, index: currentIndex };
    this.scheduler.schedule(TimeoutWithSubscriber.dispatchTimeout, this.waitFor, timeoutState);
    this.index++;
    this._previousIndex = currentIndex;
  }

  _next(value: T) {
    this.destination.next(value);
    if (!this.absoluteTimeout) {
      this.scheduleTimeout();
    }
  }

  _error(err) {
    this.destination.error(err);
    this._hasCompleted = true;
  }

  _complete() {
    this.destination.complete();
    this._hasCompleted = true;
  }

  handleTimeout(): void {
    if (!this.isUnsubscribed) {
      const withObservable = this.withObservable;
      this.unsubscribe();
      this.destination.add(this.timeoutSubscription = subscribeToResult(this, withObservable));
    }
  }
}
