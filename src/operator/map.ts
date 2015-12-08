import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

/**
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the returned observable
 *
 * @param {Function} project the function to create projection
 * @param {any} [thisArg] an optional argument to define what `this` is in the project function
 * @returns {Observable} a observable of projected values
 */
export function map<T, R>(project: (x: T, ix?: number) => R, thisArg?: any): Observable<R> {
  if (typeof project !== 'function') {
    throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
  }
  return this.lift(new MapOperator(project, thisArg));
}

class MapOperator<T, R> implements Operator<T, R> {
  constructor(private project: (x: T, ix?: number) => R, private thisArg: any) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new MapSubscriber(subscriber, this.project, this.thisArg);
  }
}

class MapSubscriber<T, R> extends Subscriber<T> {
  count: number = 0;

  constructor(destination: Subscriber<R>,
              private project: (x: T, ix?: number) => R,
              private thisArg: any) {
    super(destination);
  }

  _next(x) {
    const result = tryCatch(this.project).call(this.thisArg || this, x, this.count++);
    if (result === errorObject) {
      this.error(errorObject.e);
    } else {
      this.destination.next(result);
    }
  }
}
