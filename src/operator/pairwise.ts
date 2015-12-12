import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

/**
 * Returns a new observable that triggers on the second and following inputs.
 * An input that triggers an event will return an pair of [(N - 1)th, Nth].
 * The (N-1)th is stored in the internal state until Nth input occurs.
 * @returns {Observable<R>} an observable of pairs of values.
 */
export function pairwise<T>(): Observable<T> {
  return this.lift(new PairwiseOperator());
}

class PairwiseOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new PairwiseSubscriber(subscriber);
  }
}

class PairwiseSubscriber<T> extends Subscriber<T> {
  private prev: T;
  private hasPrev: boolean = false;

  constructor(destination: Subscriber<T>) {
    super(destination);
  }

  _next(value: T): void {
    if (this.hasPrev) {
      this.destination.next([this.prev, value]);
    } else {
      this.hasPrev = true;
    }

    this.prev = value;
  }
}
