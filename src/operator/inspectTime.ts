import {asap} from '../scheduler/asap';
import {Operator} from '../Operator';
import {Scheduler} from '../Scheduler';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';

export function inspectTime<T>(delay: number, scheduler: Scheduler = asap): Observable<T> {
  return this.lift(new InspectTimeOperator(delay, scheduler));
}

class InspectTimeOperator<T, R> implements Operator<T, R> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new InspectTimeSubscriber(subscriber, this.delay, this.scheduler);
  }
}

class InspectTimeSubscriber<T> extends Subscriber<T> {

  private value: T;
  private hasValue: boolean = false;
  private throttled: Subscription;

  constructor(destination: Subscriber<T>,
              private delay: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  protected _next(value: T): void {
    this.value = value;
    this.hasValue = true;
    if (!this.throttled) {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, this));
    }
  }

  clearThrottle(): void {
    const { value, hasValue, throttled } = this;
    if (throttled) {
      this.remove(throttled);
      this.throttled = null;
      throttled.unsubscribe();
    }
    if (hasValue) {
      this.value = null;
      this.hasValue = false;
      this.destination.next(value);
    }
  }
}

function dispatchNext<T>(subscriber: InspectTimeSubscriber<T>): void {
  subscriber.clearThrottle();
}
