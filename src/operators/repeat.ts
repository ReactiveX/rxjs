import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import EmptyObservable from '../observables/EmptyObservable';
import Subscription from '../Subscription';

export default function repeat<T>(count: number = -1): Observable<T> {
  if (count === 0) {
    return EmptyObservable.create();
  } else {
    return this.lift(new RepeatOperator(count, this));
  }
}

class RepeatOperator<T, R> implements Operator<T, R> {
  constructor(private count: number,
              private source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new FirstRepeatSubscriber(subscriber, this.count, this.source);
  }
}

class FirstRepeatSubscriber<T> extends Subscriber<T> {
  private lastSubscription: Subscription<T>;

  constructor(public destination: Subscriber<T>,
              private count: number,
              private source: Observable<T>) {
    super(null);
    if (count === 0) {
      this.destination.complete();
      super.unsubscribe();
    }
    this.lastSubscription = this;
  }

  _next(value: T) {
    this.destination.next(value);
  }

  _error(err: any) {
    this.destination.error(err);
  }

  complete() {
    if (!this.isUnsubscribed) {
      this.resubscribe(this.count);
    }
  }

  unsubscribe() {
    const lastSubscription = this.lastSubscription;
    if (lastSubscription === this) {
      super.unsubscribe();
    } else {
      lastSubscription.unsubscribe();
    }
  }

  resubscribe(count: number) {
    this.lastSubscription.unsubscribe();
    if (count - 1 === 0) {
      this.destination.complete();
    } else {
      const nextSubscriber = new MoreRepeatSubscriber(this, count - 1);
      this.lastSubscription = this.source.subscribe(nextSubscriber);
    }
  }
}

class MoreRepeatSubscriber<T> extends Subscriber<T> {
  constructor(private parent: FirstRepeatSubscriber<T>,
              private count: number) {
    super(null);
  }

  _next(value: T) {
    this.parent.destination.next(value);
  }

  _error(err: any) {
    this.parent.destination.error(err);
  }

  _complete() {
    const count = this.count;
    this.parent.resubscribe(count < 0 ? -1 : count);
  }
}
