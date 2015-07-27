import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function toArray() {
  return this.lift(new ToArrayOperator());
}

export class ToArrayOperator<T, R> extends Operator<T, R> {
  call(observer: Observer<T[]>): Observer<T> {
    return new ToArraySubscriber<T>(observer);
  }
}

export class ToArraySubscriber<T> extends Subscriber<T> {

  constructor(public    destination: Observer<T[]>,
              protected array: T [] = []) {
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
