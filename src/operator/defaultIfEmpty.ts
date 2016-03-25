import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

/**
 * Returns an Observable that emits the elements of the source or a specified default value if empty.
 * @param {any} defaultValue the default value used if source is empty; defaults to null.
 * @return {Observable} an Observable of the items emitted by the where empty values are replaced by the specified default value or null.
 * @method defaultIfEmpty
 * @owner Observable
 */
export function defaultIfEmpty<T, R>(defaultValue: R = null): Observable<T | R> {
  return this.lift(new DefaultIfEmptyOperator(defaultValue));
}

export interface DefaultIfEmptySignature<T> {
  (defaultValue?: T): Observable<T>;
  <R>(defaultValue?: R): Observable<T | R>;
}

class DefaultIfEmptyOperator<T, R> implements Operator<T, T | R> {

  constructor(private defaultValue: R) {
  }

  call(subscriber: Subscriber<T | R>, source: any): any {
    return source._subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DefaultIfEmptySubscriber<T, R> extends Subscriber<T> {
  private isEmpty: boolean = true;

  constructor(destination: Subscriber<T | R>, private defaultValue: R) {
    super(destination);
  }

  protected _next(value: T): void {
    this.isEmpty = false;
    this.destination.next(value);
  }

  protected _complete(): void {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue);
    }
    this.destination.complete();
  }
}
