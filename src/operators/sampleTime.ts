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
  
  call(observer: Observer<R>) {
    return new SampleTimeSubscriber(observer, this.delay, this.scheduler);
  }
}

class SampleTimeSubscriber<T> extends Subscriber<T> {
  lastValue: T;
  hasValue: boolean = false;
  
  constructor(destination: Observer<T>, private delay: number, private scheduler: Scheduler) {
    super(destination);
    this.add(scheduler.schedule(dispatchNotification, delay, { subscriber: this }));
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

function dispatchNotification<T>(state: { subscriber: SampleTimeSubscriber<T> }) {
  state.subscriber.notifyNext();
  (<any>this).schedule(state);
}