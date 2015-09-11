import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Scheduler from '../Scheduler';
import Subscription from '../Subscription';
import nextTick from '../schedulers/nextTick';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function throttle<T>(delay: number, scheduler: Scheduler = nextTick) {
  return this.lift(new ThrottleOperator(delay, scheduler));
}

class ThrottleOperator<T, R> implements Operator<T, R> {
  constructor(private delay:number, private scheduler:Scheduler) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new ThrottleSubscriber(subscriber, this.delay, this.scheduler);
  }
}

class ThrottleSubscriber<T, R> extends Subscriber<T> {
  private throttled: Subscription<any>;

  constructor(destination:Observer<T>, private delay:number, private scheduler:Scheduler) {
    super(destination);
  }

  _next(x) {
    this.clearThrottle();
    this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, { value: x, subscriber: this }));
  }

  throttledNext(x) {
    this.clearThrottle();
    this.destination.next(x);
  }

  clearThrottle() {
    const throttled = this.throttled;
    if (throttled) {
      this.remove(throttled);
      throttled.unsubscribe();
      this.throttled = null;
    }
  }
}

function dispatchNext({ value, subscriber }) {
  subscriber.throttledNext(value);
}
