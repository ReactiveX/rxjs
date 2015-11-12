import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {bindCallback} from '../util/bindCallback';

export function takeWhile<T>(predicate: (value: T, index: number) => boolean,
                             thisArg?: any): Observable<T> {
  return this.lift(new TakeWhileOperator(predicate, thisArg));
}

class TakeWhileOperator<T, R> implements Operator<T, R> {
  constructor(private predicate: (value: T, index: number) => boolean,
              private thisArg?: any) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeWhileSubscriber(subscriber, this.predicate, this.thisArg);
  }
}

class TakeWhileSubscriber<T> extends Subscriber<T> {
  private predicate: (value: T, index: number) => boolean;
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              predicate: (value: T, index: number) => boolean,
              thisArg?: any) {
    super(destination);
    if (typeof predicate === 'function') {
      this.predicate = <(value: T, index: number) => boolean>bindCallback(predicate, thisArg, 2);
    }
  }

  _next(value: T): void {
    const destination = this.destination;
    const result = tryCatch(this.predicate)(value, this.index++);

    if (result == errorObject) {
      destination.error(result.e);
    } else if (Boolean(result)) {
      destination.next(value);
    } else {
      destination.complete();
    }
  }
}