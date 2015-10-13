import Observable from '../Observable';
import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

/**
 * Returns an observable of a single number that represents the number of items that either:
 * Match a provided predicate function, _or_ if a predicate is not provided, the number
 * represents the total count of all items in the source observable. The count is emitted
 * by the returned observable when the source observable completes.
 * @param {function} [predicate] a boolean function to select what values are to be counted.
 * it is provided with arguments of:
 *   - `value`: the value from the source observable
 *   - `index`: the "index" of the value from the source observable
 *   - `source`: the source observable instance itself.
 * @param {any} [thisArg] the optional `this` context to use in the `predicate` function
 * @returns {Observable} an observable of one number that represents the count as described
 * above
 */
export default function count<T>(predicate?: (value: T,
                                              index: number,
                                              source: Observable<T>) => boolean,
                                 thisArg?: any): Observable<T> {
  return this.lift(new CountOperator(predicate, thisArg, this));
}

class CountOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new CountSubscriber<T>(
      subscriber, this.predicate, this.thisArg, this.source
    );
  }
}

class CountSubscriber<T> extends Subscriber<T> {
  private predicate: Function;
  private count: number = 0;
  private index: number = 0;

  constructor(destination: Observer<T>,
              predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
    super(destination);
    if (typeof predicate === 'function') {
      this.predicate = bindCallback(predicate, thisArg, 3);
    }
  }

  _next(value: T) {
    const predicate = this.predicate;
    let passed: any = true;
    if (predicate) {
      passed = tryCatch(predicate)(value, this.index++, this.source);
      if (passed === errorObject) {
        this.destination.error(passed.e);
        return;
      }
    }
    if (passed) {
      this.count += 1;
    }
  }

  _complete() {
    this.destination.next(this.count);
    this.destination.complete();
  }
}
