import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function skip(total) {
  return this.lift(new SkipOperator(total));
}

export class SkipOperator<T, R> implements Operator<T, R> {

  total: number;

  constructor(total: number) {
    this.total = total;
  }

  call(observer: Observer<R>): Observer<T> {
    return new SkipSubscriber(observer, this.total);
  }
}

export class SkipSubscriber<T> extends Subscriber<T> {

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
