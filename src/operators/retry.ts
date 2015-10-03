import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

export default function retry<T>(count: number = 0): Observable<T> {
  return this.lift(new RetryOperator(count, this));
}

class RetryOperator<T, R> implements Operator<T, R> {
  constructor(private count: number, protected original: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new RetrySubscriber<T>(subscriber, this.count, this.original);
  }
}

class RetrySubscriber<T> extends Subscriber<T> {
  private retries: number = 0;
  constructor(destination: Subscriber<T>, private count: number, private original: Observable<T>) {
    super(destination);
  }

  _error(err: any) {
    const count = this.count;
    if (count && count === (this.retries += 1)) {
      this.destination.error(err);
    } else {
      this.resubscribe();
    }
  }

  resubscribe() {
    this.original.subscribe(this);
  }
}