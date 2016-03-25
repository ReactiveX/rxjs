import {async} from '../scheduler/async';
import {isDate} from '../util/isDate';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';

/**
 * @param due
 * @param errorToSend
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method timeout
 * @owner Observable
 */
export function timeout<T>(due: number | Date,
                           errorToSend: any = null,
                           scheduler: Scheduler = async): Observable<T> {
  let absoluteTimeout = isDate(due);
  let waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(<number>due);
  return this.lift(new TimeoutOperator(waitFor, absoluteTimeout, errorToSend, scheduler));
}

export interface TimeoutSignature<T> {
  (due: number | Date, errorToSend?: any, scheduler?: Scheduler): Observable<T>;
}

class TimeoutOperator<T> implements Operator<T, T> {
  constructor(private waitFor: number,
              private absoluteTimeout: boolean,
              private errorToSend: any,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
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

  protected _next(value: T) {
    this.destination.next(value);

    if (!this.absoluteTimeout) {
      this.scheduleTimeout();
    }
  }

  protected _error(err: any) {
    this.destination.error(err);
    this._hasCompleted = true;
  }

  protected _complete() {
    this.destination.complete();
    this._hasCompleted = true;
  }

  notifyTimeout() {
    this.error(this.errorToSend || new Error('timeout'));
  }
}
