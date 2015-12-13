import {Operator} from '../../Operator';
import {Subscriber} from '../../Subscriber';
import {ArgumentOutOfRangeError} from '../../util/ArgumentOutOfRangeError';
import {Observable} from '../../Observable';

export function elementAt<T>(index: number, defaultValue?: T): Observable<T> {
  return this.lift(new ElementAtOperator(index, defaultValue));
}

class ElementAtOperator<T> implements Operator<T, T> {

  constructor(private index: number, private defaultValue?: T) {
    if (index < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ElementAtSubscriber(subscriber, this.index, this.defaultValue);
  }
}

class ElementAtSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<T>, private index: number, private defaultValue?: T) {
    super(destination);
  }

  _next(x: T) {
    if (this.index-- === 0) {
      this.destination.next(x);
      this.destination.complete();
    }
  }

  _complete() {
    const destination = this.destination;
    if (this.index >= 0) {
      if (typeof this.defaultValue !== 'undefined') {
        destination.next(this.defaultValue);
      } else {
        destination.error(new ArgumentOutOfRangeError);
      }
    }
    destination.complete();
  }
}
