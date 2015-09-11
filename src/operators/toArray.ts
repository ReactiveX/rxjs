import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function toArray() {
  return this.lift(new ToArrayOperator());
}

class ToArrayOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<T[]>): Subscriber<T> {
    return new ToArraySubscriber<T>(subscriber);
  }
}

class ToArraySubscriber<T> extends Subscriber<T> {

  array: T [] = [];

  constructor(destination: Observer<T[]>) {
    super(destination);
  }

  _next(x) {
    this.array.push(x);
  }

  _complete() {
    this.destination.next(this.array);
    this.destination.complete();
  }
}
