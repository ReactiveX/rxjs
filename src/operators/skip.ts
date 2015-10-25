import Operator from '../Operator';
import Subscriber from '../Subscriber';

export default function skip(total) {
  return this.lift(new SkipOperator(total));
}

class SkipOperator<T, R> implements Operator<T, R> {
  constructor(private total: number) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SkipSubscriber(subscriber, this.total);
  }
}

class SkipSubscriber<T> extends Subscriber<T> {
  count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  _next(x) {
    if (++this.count > this.total) {
      this.destination.next(x);
    }
  }
}
