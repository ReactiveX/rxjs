import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function take(total) {
  return this.lift(new TakeOperator(total));
}

class TakeOperator<T, R> implements Operator<T, R> {

  total: number;

  constructor(total: number) {
    this.total = total;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new TakeSubscriber(subscriber, this.total);
  }
}

class TakeSubscriber<T> extends Subscriber<T> {

  total: number;
  count: number = 0;

  constructor(destination: Subscriber<T>, total: number) {
    super(destination);
    this.total = total;
  }

  _next(x) {
    const total = this.total;
    if (++this.count <= total) {
      this.destination.next(x);
      if (this.count === total) {
        this.destination.complete();
      }
    }
  }
}
