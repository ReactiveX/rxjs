import Operator from '../Operator';
import Subscriber from '../Subscriber';

export default function ignoreElements() {
  return this.lift(new IgnoreElementsOperator());
};

class IgnoreElementsOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new IgnoreElementsSubscriber(subscriber);
  }
}

class IgnoreElementsSubscriber<T> extends Subscriber<T> {
  _next() {}
}
