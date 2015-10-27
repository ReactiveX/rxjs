import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import immediate from '../schedulers/immediate';
import Subscription from '../Subscription';
import Observable from '../Observable';
import isDate from '../util/isDate';
import OuterSubscriber from '../OuterSubscriber';
import subscribeToResult from '../util/subscribeToResult';

export default function timeoutWith(due: number|Date,
                                    withObservable: Observable<any>,
                                    scheduler: Scheduler = immediate) {
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
  private timedOut: boolean = false;
  private index: number = 0;
  private _previousIndex: number = 0;
  get previousIndex(): number {
    return this._previousIndex;
  }
  private _hasCompleted: boolean = false;
  get hasCompleted(): boolean {
    return this._hasCompleted;
  }

  constructor(destination: Subscriber<T>,
              private absoluteTimeout: boolean,
              private waitFor: number,
              private withObservable: Observable<any>,
              private scheduler: Scheduler) {
    super(destination);
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
    if (!this.timedOut) {
      this.destination.next(value);
      if (!this.absoluteTimeout) {
        this.scheduleTimeout();
      }
    }
  }

  _error(err) {
    if (!this.timedOut) {
      this.destination.error(err);
      this._hasCompleted = true;
    }
  }

  _complete() {
    if (!this.timedOut) {
      this.destination.complete();
      this._hasCompleted = true;
    }
  }

  handleTimeout(): void {
    const withObservable = this.withObservable;
    this.timedOut = true;
    this.add(this.timeoutSubscription = subscribeToResult(this, withObservable));
  }
}
