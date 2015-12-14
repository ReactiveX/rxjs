import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {asap} from '../scheduler/asap';

export function inspectTime<T>(delay: number, scheduler: Scheduler = asap): Observable<T> {
  return this.lift(new InspectTimeOperator(delay, scheduler));
}

class InspectTimeOperator<T, R> implements Operator<T, R> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<R>) {
    return new InspectTimeSubscriber(subscriber, this.delay, this.scheduler);
  }
}

class InspectTimeSubscriber<T> extends Subscriber<T> {
  lastValue: T;
  hasValue: boolean = false;

  constructor(destination: Subscriber<T>, private delay: number, private scheduler: Scheduler) {
    super(destination);
    this.add(scheduler.schedule(dispatchNotification, delay, { subscriber: this, delay }));
  }

  _next(value: T) {
    this.lastValue = value;
    this.hasValue = true;
  }

  notifyNext() {
    if (this.hasValue) {
      this.destination.next(this.lastValue);
    }
  }
}

function dispatchNotification<T>(state) {
  let { subscriber, delay } = state;
  subscriber.notifyNext();
  (<any>this).schedule(state, delay);
}
