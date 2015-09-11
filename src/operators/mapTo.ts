import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function mapTo<T, R>(value: R) {
  return this.lift(new MapToOperator(value));
}

class MapToOperator<T, R> implements Operator<T, R> {

  value: R;

  constructor(value: R) {
    this.value = value;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new MapToSubscriber(subscriber, this.value);
  }
}

class MapToSubscriber<T, R> extends Subscriber<T> {

  value: R;

  constructor(destination: Observer<R>, value: R) {
    super(destination);
    this.value = value;
  }

  _next(x) {
    this.destination.next(this.value);
  }
}