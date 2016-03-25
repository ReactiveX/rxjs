import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {async} from '../scheduler/async';

/**
 * @param scheduler
 * @return {Observable<TimeInterval<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timeInterval
 * @owner Observable
 */
export function timeInterval<T>(scheduler: Scheduler = async): Observable<TimeInterval<T>> {
  return this.lift(new TimeIntervalOperator(scheduler));
}

export interface TimeIntervalSignature<T> {
  (scheduler?: Scheduler): Observable<TimeInterval<T>>;
}

export class TimeInterval<T> {
  constructor(public value: T, public interval: number) {

  }
};

class TimeIntervalOperator<T> implements Operator<T, TimeInterval<T>> {
  constructor(private scheduler: Scheduler) {

  }

  call(observer: Subscriber<TimeInterval<T>>, source: any): any {
    return source._subscribe(new TimeIntervalSubscriber(observer, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TimeIntervalSubscriber<T> extends Subscriber<T> {
  private lastTime: number = 0;

  constructor(destination: Subscriber<TimeInterval<T>>, private scheduler: Scheduler) {
    super(destination);

    this.lastTime = scheduler.now();
  }

  protected _next(value: T) {
    let now = this.scheduler.now();
    let span = now - this.lastTime;
    this.lastTime = now;

    this.destination.next(new TimeInterval(value, span));
  }
}
