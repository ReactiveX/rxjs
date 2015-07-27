import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function take(total) {
  return this.lift(new TakeOperator(total));
}

export class TakeOperator<T, R> extends Operator<T, R> {

  constructor(protected total: number) {
    super();
  }

  call(observer: Observer<R>): Observer<T> {
    return new TakeSubscriber<T>(observer, this.total);
  }
}

export class TakeSubscriber<T> extends Subscriber<T> {

  constructor(public    destination: Observer<T>,
              protected total: number,
              protected count: number = 0) {
    super(destination);
  }

  _next(x) {
    if (++this.count <= this.total) {
      this.destination.next(x);
    } else {
      this.destination.complete();
    }
  }
}
