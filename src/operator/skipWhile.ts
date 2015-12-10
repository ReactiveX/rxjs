import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {_IndexPredicate} from '../types';

export function skipWhile<T>(predicate: _IndexPredicate<T>): Observable<T> {
  return this.lift(new SkipWhileOperator(predicate));
}

class SkipWhileOperator<T, R> implements Operator<T, R> {
  constructor(private predicate: _IndexPredicate<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SkipWhileSubscriber(subscriber, this.predicate);
  }
}

class SkipWhileSubscriber<T> extends Subscriber<T> {
  private skipping: boolean = true;
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: _IndexPredicate<T>) {
    super(destination);
  }

  _next(value: T): void {
    const destination = this.destination;
    if (this.skipping === true) {
      const index = this.index++;
      const result = tryCatch(this.predicate)(value, index);
      if (result as any === errorObject) {
        destination.error(errorObject.e);
      } else {
        this.skipping = Boolean(result);
      }
    }
    if (this.skipping === false) {
      destination.next(value);
    }
  }
}
