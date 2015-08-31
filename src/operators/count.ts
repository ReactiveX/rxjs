import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function count() {
  return this.lift(new CountOperator());
}

export class CountOperator<T, R> implements Operator<T, R> {
  call(observer: Observer<number>): Observer<T> {
    return new CountSubscriber<T>(observer);
  }
}

export class CountSubscriber<T> extends Subscriber<T> {

  count: number = 0;

  constructor(destination: Observer<number>) {
    super(destination);
  }

  _next(x) {
    this.count += 1;
  }

  _complete() {
    this.destination.next(this.count);
    this.destination.complete();
  }
}
