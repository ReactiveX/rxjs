import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

/**
 * Ignores all items emitted by the source Observable and only passes calls of onCompleted or onError.
 *
 * <img src="./img/ignoreElements.png" width="100%">
 *
 * @returns {Observable} an empty Observable that only calls onCompleted
 * or onError, based on which one is called by the source Observable.
 */
export function ignoreElements() {
  return this.lift(new IgnoreElementsOperator());
};

class IgnoreElementsOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new IgnoreElementsSubscriber(subscriber);
  }
}

class IgnoreElementsSubscriber<T> extends Subscriber<T> {
  _next(unused: T): void {
    noop();
  }
}
