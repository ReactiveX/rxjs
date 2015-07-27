import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function skip(total) {
  return this.lift(new SkipOperator(total));
}

export class SkipOperator<T, R> extends Operator<T, R> {

  constructor(protected total: number) {
    super();
  }

  call(observer: Observer<R>): Observer<T> {
    return new SkipSubscriber<T>(observer, this.total);
  }
}

export class SkipSubscriber<T> extends Subscriber<T> {

  constructor(public    destination: Observer<T>,
              protected total: number, protected count: number = 0) {
    super(destination);
  }

  _next(x) {
    if (++this.count > this.total) {
      this.destination.next(x);
    }
  }
}
