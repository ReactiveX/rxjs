import Observable from '../Observable';
import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import Scheduler from '../Scheduler';
import nextTick from '../schedulers/nextTick';

export default function sampleTime<T>(delay: number, scheduler: Scheduler = nextTick): Observable<T> {
  return this.lift(new SampleTimeOperator(delay, scheduler));
}

class SampleTimeOperator<T, R> implements Operator<T, R> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<R>) {
    return new SampleTimeSubscriber(subscriber, this.delay, this.scheduler);
  }
}

class SampleTimeSubscriber<T> extends Subscriber<T> {
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