import Operator from '../Operator';
import Subscriber from '../Subscriber';

export default function take(total) {
  return this.lift(new TakeOperator(total));
}

class TakeOperator<T, R> implements Operator<T, R> {
  constructor(private total: number) {
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
