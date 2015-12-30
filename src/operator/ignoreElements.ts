import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

export function ignoreElements<T>(): Observable<T> {
  return this.lift(new IgnoreElementsOperator());
};

class IgnoreElementsOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new IgnoreElementsSubscriber(subscriber);
  }
}

class IgnoreElementsSubscriber<T> extends Subscriber<T> {
  protected _next(unused: T): void {
    noop();
  }
}
