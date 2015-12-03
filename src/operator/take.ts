import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {ArgumentOutOfRangeError} from '../util/ArgumentOutOfRangeError';
import {EmptyObservable} from '../observable/empty';

export function take(total) {
  if (total === 0) {
    return new EmptyObservable();
  } else {
    return this.lift(new TakeOperator(total));
  }
}

class TakeOperator<T, R> implements Operator<T, R> {
  constructor(private total: number) {
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeSubscriber(subscriber, this.total);
  }
}

class TakeSubscriber<T> extends Subscriber<T> {
  private count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  _next(value: T): void {
    const total = this.total;
    if (++this.count <= total) {
      this.destination.next(value);
      if (this.count === total) {
        this.destination.complete();
      }
    }
  }
}
