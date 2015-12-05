import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {EmptyObservable} from '../observable/empty';
import {Subscription} from '../Subscription';

export function repeat<T>(count: number = -1): Observable<T> {
  if (count === 0) {
    return new EmptyObservable();
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
    super();
    destination.add(this);
    this.lastSubscription = this;
  }

  _next(value: T): void {
    this.destination.next(value);
  }

  _error(err: any): void {
    this.destination.error(err);
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      this.resubscribe(this.count);
    }
  }

  unsubscribe(): void {
    const lastSubscription = this.lastSubscription;
    if (lastSubscription === this) {
      super.unsubscribe();
    } else {
      lastSubscription.unsubscribe();
    }
  }

  resubscribe(count: number): void {
    const { destination, lastSubscription } = this;
    destination.remove(lastSubscription);
    lastSubscription.unsubscribe();
    if (count - 1 === 0) {
      destination.complete();
    } else {
      const nextSubscriber = new MoreRepeatSubscriber(this, count - 1);
      this.lastSubscription = this.source.subscribe(nextSubscriber);
      destination.add(this.lastSubscription);
    }
  }
}

class MoreRepeatSubscriber<T> extends Subscriber<T> {
  constructor(private parent: FirstRepeatSubscriber<T>,
              private count: number) {
    super();
  }

  _next(value: T): void {
    this.parent.destination.next(value);
  }

  _error(err: any): void {
    this.parent.destination.error(err);
  }

  _complete(): void {
    const count = this.count;
    this.parent.resubscribe(count < 0 ? -1 : count);
  }
}
