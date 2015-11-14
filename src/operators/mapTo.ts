import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';

/**
 * Maps every value to the same value every time.
 * @param {any} value the value to map each incoming value to
 * @returns {Observable} an observable of the passed value that emits everytime the source does
 */
export function mapTo<T>(value: T): Observable<T>;
export function mapTo<T, R>(value: R): Observable<R>;
export function mapTo(value: any): Observable<any> {
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

  constructor(destination: Subscriber<R>, value: R) {
    super(destination);
    this.value = value;
  }

  _next(x) {
    this.destination.next(this.value);
  }
}
