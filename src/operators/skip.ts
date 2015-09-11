import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function skip(total) {
  return this.lift(new SkipOperator(total));
}

class SkipOperator<T, R> implements Operator<T, R> {

  total: number;

  constructor(total: number) {
    this.total = total;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SkipSubscriber(subscriber, this.total);
  }
}

class SkipSubscriber<T> extends Subscriber<T> {

  total: number;
  count: number = 0;

  constructor(destination: Observer<T>, total: number) {
    super(destination);
    this.total = total;
  }

  _next(x) {
    if (++this.count > this.total) {
      this.destination.next(x);
    }
  }
}
