import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

/**
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the returned observable
 * 
 * @param {Function} project the function to create projection
 * @param {any} [thisArg] an optional argument to define what `this` is in the project function
 * @returns {Observable} a observable of projected values
 */
export default function map<T, R>(project: (x: T, ix?: number) => R, thisArg?: any): Observable<R> {
  return this.lift(new MapOperator(project, thisArg));
}

class MapOperator<T, R> implements Operator<T, R> {

  project: (x: T, ix?: number) => R;

  constructor(project: (x: T, ix?: number) => R, thisArg?: any) {
    this.project = <(x: T, ix?: number) => R>bindCallback(project, thisArg, 2);
  }
  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new MapSubscriber(subscriber, this.project);
  }
}

class MapSubscriber<T, R> extends Subscriber<T> {

  count: number = 0;
  project: (x: T, ix?: number) => R;

  constructor(destination: Subscriber<R>,
              project: (x: T, ix?: number) => R) {
    super(destination);
    this.project = project;
  }

  _next(x) {
    const result = tryCatch(this.project)(x, this.count++);
    if (result === errorObject) {
      this.error(errorObject.e);
    } else {
      this.destination.next(result);
    }
  }
}
