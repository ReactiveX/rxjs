import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

/**
 * Returns an Observable that emits the elements of the source or a specified default value if empty.
 * @param {any} defaultValue the default value used if source is empty; defaults to null.
 * @returns {Observable} an Observable of the items emitted by the where empty values are replaced by the specified default value or null.
 */
export function defaultIfEmpty<T, R>(defaultValue: R = null): Observable<T> | Observable<R> {
  return this.lift(new DefaultIfEmptyOperator(defaultValue));
}

class DefaultIfEmptyOperator<T, R> implements Operator<T, R> {

  constructor(private defaultValue: R) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DefaultIfEmptySubscriber(subscriber, this.defaultValue);
  }
}

class DefaultIfEmptySubscriber<T, R> extends Subscriber<T> {
  private isEmpty: boolean = true;

  constructor(destination: Subscriber<T>, private defaultValue: R) {
    super(destination);
  }

  _next(value: T): void {
    this.isEmpty = false;
    this.destination.next(value);
  }

  _complete(): void {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue);
    }
    this.destination.complete();
  }
}
