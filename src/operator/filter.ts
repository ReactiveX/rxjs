import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

/**
 * Similar to the well-known `Array.prototype.filter` method, this operator filters values down to a set
 * allowed by a `select` function
 *
 * @param {Function} select a function that is used to select the resulting values
 *  if it returns `true`, the value is emitted, if `false` the value is not passed to the resulting observable
 * @param {any} [thisArg] an optional argument to determine the value of `this` in the `select` function
 * @return {Observable} an observable of values allowed by the select function
 * @method filter
 * @owner Observable
 */
export function filter<T>(select: (value: T, index: number) => boolean, thisArg?: any): Observable<T> {
  return this.lift(new FilterOperator(select, thisArg));
}

export interface FilterSignature<T> {
  (select: (value: T, index: number) => boolean, thisArg?: any): Observable<T>;
}

class FilterOperator<T> implements Operator<T, T> {
  constructor(private select: (value: T, index: number) => boolean, private thisArg?: any) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new FilterSubscriber(subscriber, this.select, this.thisArg));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class FilterSubscriber<T> extends Subscriber<T> {

  count: number = 0;

  constructor(destination: Subscriber<T>, private select: (value: T, index: number) => boolean, private thisArg: any) {
    super(destination);
    this.select = select;
  }

  // the try catch block below is left specifically for
  // optimization and perf reasons. a tryCatcher is not necessary here.
  protected _next(value: T) {
    let result: any;
    try {
      result = this.select.call(this.thisArg, value, this.count++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (result) {
      this.destination.next(value);
    }
  }
}
