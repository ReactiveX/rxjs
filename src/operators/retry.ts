import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subscription from '../Subscription';

export default function retry<T>(count: number = 0): Observable<T> {
  return this.lift(new RetryOperator(count, this));
}

class RetryOperator<T, R> implements Operator<T, R> {
  constructor(private count: number,
              protected source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new FirstRetrySubscriber<T>(subscriber, this.count, this.source);
  }
}

class FirstRetrySubscriber<T> extends Subscriber<T> {
  private lastSubscription: Subscription<T>;

  constructor(public destination: Subscriber<T>,
              private count: number,
              private source: Observable<T>) {
    super(null);
    this.lastSubscription = this;
  }

  _next(value: T) {
    this.destination.next(value);
  }

  error(error?) {
    if (!this.isUnsubscribed) {
      super.unsubscribe();
      this.resubscribe();
    }
  }

  _complete() {
    super.unsubscribe();
    this.destination.complete();
  }

  unsubscribe() {
    const lastSubscription = this.lastSubscription;
    if (lastSubscription === this) {
      super.unsubscribe();
    } else {
      lastSubscription.unsubscribe();
    }
  }

  resubscribe(retried: number = 0) {
    this.lastSubscription.unsubscribe();
    const nextSubscriber = new RetryMoreSubscriber(this, this.count, retried + 1);
    this.lastSubscription = this.source.subscribe(nextSubscriber);
  }
}

class RetryMoreSubscriber<T> extends Subscriber<T> {
  constructor(private parent: FirstRetrySubscriber<T>,
              private count: number,
              private retried: number = 0) {
    super(null);
  }

  _next(value: T) {
    this.parent.destination.next(value);
  }

  _error(err: any) {
    const parent = this.parent;
    const retried = this.retried;
    const count = this.count;

    if (count && retried === count) {
      parent.destination.error(err);
    } else {
      parent.resubscribe(retried);
    }
  }

  _complete() {
    this.parent.destination.complete();
  }
}
