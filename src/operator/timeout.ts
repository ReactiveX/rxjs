import { async } from '../scheduler/async';
import { isDate } from '../util/isDate';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';
import { TimeoutError } from '../util/TimeoutError';

/**
 * @param {number} due
 * @param {Scheduler} [scheduler]
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method timeout
 * @owner Observable
 */
export function timeout<T>(this: Observable<T>,
                           due: number | Date,
                           scheduler: IScheduler = async): Observable<T> {
  const absoluteTimeout = isDate(due);
  const waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(<number>due);
  return this.lift(new TimeoutOperator(waitFor, absoluteTimeout, scheduler, new TimeoutError()));
}

class TimeoutOperator<T> implements Operator<T, T> {
  constructor(private waitFor: number,
              private absoluteTimeout: boolean,
              private scheduler: IScheduler,
              private errorInstance: TimeoutError) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new TimeoutSubscriber<T>(
      subscriber, this.absoluteTimeout, this.waitFor, this.scheduler, this.errorInstance
    ));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
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
              private scheduler: IScheduler,
              private errorInstance: TimeoutError) {
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

  protected _next(value: T): void {
    this.destination.next(value);

    if (!this.absoluteTimeout) {
      this.scheduleTimeout();
    }
  }

  protected _error(err: any): void {
    this.destination.error(err);
    this._hasCompleted = true;
  }

  protected _complete(): void {
    this.destination.complete();
    this._hasCompleted = true;
  }

  notifyTimeout(): void {
    this.error(this.errorInstance);
  }
}
