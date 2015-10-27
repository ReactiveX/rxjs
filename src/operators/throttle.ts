import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import Subscription from '../Subscription';
import nextTick from '../schedulers/nextTick';

export default function throttle<T>(delay: number, scheduler: Scheduler = nextTick) {
  return this.lift(new ThrottleOperator(delay, scheduler));
}

class ThrottleOperator<T, R> implements Operator<T, R> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ThrottleSubscriber(subscriber, this.delay, this.scheduler);
  }
}

class ThrottleSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription<any>;

  constructor(destination: Subscriber<T>,
              private delay: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  _next(value: T) {
    if (!this.throttled) {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, { value, subscriber: this }));
    }
  }

  throttledNext(value: T) {
    this.clearThrottle();
    this.destination.next(value);
  }

  clearThrottle() {
    const throttled = this.throttled;
    if (throttled) {
      throttled.unsubscribe();
      this.remove(throttled);
    }
  }
}

function dispatchNext<T>({ value, subscriber }) {
  subscriber.throttledNext(value);
}