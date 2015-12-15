import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {ArgumentOutOfRangeError} from '../util/ArgumentOutOfRangeError';

/**
 * Returns an Observable that emits the item at the specified index in the source Observable.
 * If default is given, missing indices will output this value on next; otherwise, outputs error.
 * @param {number} index the index of the value to be retrieved.
 * @param {any} [defaultValue] the default value returned for missing indices.
 * @returns {Observable} an Observable that emits a single item, if it is found. Otherwise, will emit the default value if given.
 */
export function elementAt(index: number, defaultValue?: any) {
  return this.lift(new ElementAtOperator(index, defaultValue));
}

class ElementAtOperator<T, R> implements Operator<T, R> {

  constructor(private index: number, private defaultValue?: any) {
    if (index < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ElementAtSubscriber(subscriber, this.index, this.defaultValue);
  }
}

class ElementAtSubscriber<T, R> extends Subscriber<T> {

  constructor(destination: Subscriber<T>, private index: number, private defaultValue?: any) {
    super(destination);
  }

  _next(x) {
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
