import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import immediate from '../schedulers/immediate';
import Subscription from '../Subscription';
import isDate from '../util/isDate';

export default function timeout(due: number|Date,
                                errorToSend: any = null,
                                scheduler: Scheduler = immediate) {
  let absoluteTimeout = isDate(due);
  let waitFor = absoluteTimeout ? (+due - scheduler.now()) : <number>due;
  return this.lift(new TimeoutOperator(waitFor, absoluteTimeout, errorToSend, scheduler));
}

class TimeoutOperator<T, R> implements Operator<T, R> {
  constructor(private waitFor: number,
              private absoluteTimeout: boolean,
              private errorToSend: any,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<R>) {
    return new TimeoutSubscriber(
      subscriber, this.absoluteTimeout, this.waitFor, this.errorToSend, this.scheduler
    );
  }
}

class TimeoutSubscriber<T> extends Subscriber<T> {
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
              private errorToSend: any,
              private scheduler: Scheduler) {
    super(destination);
    this.scheduleTimeout();
  }

  private static dispatchTimeout(state: any): void {
    const source = state.subscriber;
    const currentIndex = state.index;
    if (!source.hasCompleted && source.previousIndex === currentIndex) {
      source.notifyTimeout();
    }
  }

  private scheduleTimeout(): void {
    let currentIndex = this.index;
    this.scheduler.schedule(TimeoutSubscriber.dispatchTimeout, this.waitFor, { subscriber: this, index: currentIndex });
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

  notifyTimeout() {
    this.error(this.errorToSend || new Error('timeout'));
  }
}
