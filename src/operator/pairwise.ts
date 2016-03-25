import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

/**
 * Returns a new observable that triggers on the second and following inputs.
 * An input that triggers an event will return an pair of [(N - 1)th, Nth].
 * The (N-1)th is stored in the internal state until Nth input occurs.
 *
 * <img src="./img/pairwise.png" width="100%">
 *
 * @return {Observable<R>} an observable of pairs of values.
 * @method pairwise
 * @owner Observable
 */
export function pairwise<T>(): Observable<[T, T]> {
  return this.lift(new PairwiseOperator());
}

export interface PairwiseSignature<T> {
  (): Observable<[T, T]>;
}

class PairwiseOperator<T> implements Operator<T, [T, T]> {
  call(subscriber: Subscriber<[T, T]>, source: any): any {
    return source._subscribe(new PairwiseSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class PairwiseSubscriber<T> extends Subscriber<T> {
  private prev: T;
  private hasPrev: boolean = false;

  constructor(destination: Subscriber<[T, T]>) {
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
