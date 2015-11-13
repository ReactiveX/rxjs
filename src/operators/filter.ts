import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {bindCallback} from '../util/bindCallback';
import {_Predicate} from '../types';

/**
 * Similar to the well-known `Array.prototype.filter` method, this operator filters values down to a set
 * allowed by a `select` function
 *
 * @param {Function} select a function that is used to select the resulting values
 *  if it returns `true`, the value is emitted, if `false` the value is not passed to the resulting observable
 * @param {any} [thisArg] an optional argument to determine the value of `this` in the `select` function
 * @returns {Observable} an observable of values allowed by the select function
 */
export function filter<T>(select: _Predicate<T>, thisArg?: any): Observable<T> {
  return this.lift(new FilterOperator(select, thisArg));
}

class FilterOperator<T, R> implements Operator<T, R> {

  select: _Predicate<T>;

  constructor(select: _Predicate<T>, thisArg?: any) {
    this.select = <_Predicate<T>>bindCallback(select, thisArg, 2);
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new FilterSubscriber(subscriber, this.select);
  }
}

class FilterSubscriber<T> extends Subscriber<T> {

  count: number = 0;
  select: _Predicate<T>;

  constructor(destination: Subscriber<T>, select: _Predicate<T>) {
    super(destination);
    this.select = select;
  }

  _next(x) {
    const result = tryCatch(this.select)(x, this.count++);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else if (Boolean(result)) {
      this.destination.next(x);
    }
  }
}
