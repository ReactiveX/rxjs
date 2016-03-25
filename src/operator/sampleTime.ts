import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {async} from '../scheduler/async';

/**
 * @param delay
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method sampleTime
 * @owner Observable
 */
export function sampleTime<T>(delay: number, scheduler: Scheduler = async): Observable<T> {
  return this.lift(new SampleTimeOperator(delay, scheduler));
}

export interface SampleTimeSignature<T> {
  (delay: number, scheduler?: Scheduler): Observable<T>;
}

class SampleTimeOperator<T> implements Operator<T, T> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new SampleTimeSubscriber(subscriber, this.delay, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SampleTimeSubscriber<T> extends Subscriber<T> {
  lastValue: T;
  hasValue: boolean = false;

  constructor(destination: Subscriber<T>, private delay: number, private scheduler: Scheduler) {
    super(destination);
    this.add(scheduler.schedule(dispatchNotification, delay, { subscriber: this, delay }));
  }

  protected _next(value: T) {
    this.lastValue = value;
    this.hasValue = true;
  }

  notifyNext() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.lastValue);
    }
  }
}

function dispatchNotification<T>(state: any) {
  let { subscriber, delay } = state;
  subscriber.notifyNext();
  (<any>this).schedule(state, delay);
}
