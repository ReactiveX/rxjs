import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';

/**
 * If the source Observable is empty it returns an Observable that emits true , otherwise it emits false
 *
 * <img src="./img/isEmpty.png" width="100%">
 *
 * @returns {Observable} an Observable that emits a Boolean.
 */
export function isEmpty() {
  return this.lift(new IsEmptyOperator());
}

class IsEmptyOperator<T, R> implements Operator<T, R> {
  call (observer: Subscriber<boolean>): Subscriber<T> {
    return new IsEmptySubscriber<T>(observer);
  }
}

class IsEmptySubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<boolean>) {
    super(destination);
  }

  private notifyComplete(isEmpty: boolean): void {
    const destination = this.destination;

    destination.next(isEmpty);
    destination.complete();
  }

  _next(value: T) {
    this.notifyComplete(false);
  }

  _complete() {
    this.notifyComplete(true);
  }
}
