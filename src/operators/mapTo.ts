import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function mapTo<T, R>(value: R) {
  return this.lift(new MapToOperator(value));
}

export class MapToOperator<T, R> implements Operator<T, R> {

  value: R;

  constructor(value: R) {
    this.value = value;
  }

  call(observer: Observer<R>): Observer<T> {
    return new MapToSubscriber(observer, this.value);
  }
}

export class MapToSubscriber<T, R> extends Subscriber<T> {

  value: R;

  constructor(destination: Observer<R>, value: R) {
    super(destination);
    this.value = value;
  }

  _next(x) {
    this.destination.next(this.value);
  }
}