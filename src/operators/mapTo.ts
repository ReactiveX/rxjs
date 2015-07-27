import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default function mapTo<T, R>(value: R) {
  return this.lift(new MapToOperator(value));
}

export class MapToOperator<T, R> extends Operator<T, R> {
  constructor(protected value: R) {
    super();
  }
  call(observer: Observer<R>): Observer<T> {
    return new MapToSubscriber(observer, this.value);
  }
}

export class MapToSubscriber<T, R> extends Subscriber<T> {

  constructor(public    destination: Observer<R>,
              protected value: R) {
    super(destination);
  }

  _next(x) {
    this.destination.next(this.value);
  }
}