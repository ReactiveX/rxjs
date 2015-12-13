import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {_IndexPredicate} from '../types';

export function takeWhile<T>(predicate: _IndexPredicate<T>): Observable<T> {
  return this.lift(new TakeWhileOperator(predicate));
}

class TakeWhileOperator<T> implements Operator<T, T> {
  constructor(private predicate: _IndexPredicate<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeWhileSubscriber(subscriber, this.predicate);
  }
}

class TakeWhileSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: _IndexPredicate<T>) {
    super(destination);
  }

  _next(value: T): void {
    const destination = this.destination;
    const result = tryCatch(this.predicate)(value, this.index++);

    if (result as any == errorObject) {
      destination.error(errorObject.e);
    } else if (Boolean(result)) {
      destination.next(value);
    } else {
      destination.complete();
    }
  }
}
