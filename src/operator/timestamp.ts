import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Scheduler } from '../Scheduler';
import { async } from '../scheduler/async';

/**
 * @param scheduler
 * @return {Observable<Timestamp<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timestamp
 * @owner Observable
 */
export function timestamp<T>(this: Observable<T>, scheduler: Scheduler = async): Observable<Timestamp<T>> {
  return this.lift(new TimestampOperator(scheduler));
}

export class Timestamp<T> {
  constructor(public value: T, public timestamp: number) {
  }
};

class TimestampOperator<T> implements Operator<T, Timestamp<T>> {
  constructor(private scheduler: Scheduler) {
  }

  call(observer: Subscriber<Timestamp<T>>, source: any): any {
    return source.subscribe(new TimestampSubscriber(observer, this.scheduler));
  }
}

class TimestampSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<Timestamp<T>>, private scheduler: Scheduler) {
    super(destination);
  }

  protected _next(value: T): void {
    const now = this.scheduler.now();

    this.destination.next(new Timestamp(value, now));
  }
}
