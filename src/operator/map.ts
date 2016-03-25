import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

/**
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the returned observable
 *
 * <img src="./img/map.png" width="100%">
 *
 * @param {Function} project the function to create projection
 * @param {any} [thisArg] an optional argument to define what `this` is in the project function
 * @return {Observable} a observable of projected values
 * @method map
 * @owner Observable
 */
export function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): Observable<R> {
  if (typeof project !== 'function') {
    throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
  }
  return this.lift(new MapOperator(project, thisArg));
}

export interface MapSignature<T> {
  <R>(project: (value: T, index: number) => R, thisArg?: any): Observable<R>;
}

class MapOperator<T, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => R, private thisArg: any) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class MapSubscriber<T, R> extends Subscriber<T> {
  count: number = 0;
  private thisArg: any;

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => R,
              thisArg: any) {
    super(destination);
    this.thisArg = thisArg || this;
  }

  // NOTE: This looks unoptimized, but it's actually purposefully NOT
  // using try/catch optimizations.
  protected _next(value: T) {
    let result: any;
    try {
      result = this.project.call(this.thisArg, value, this.count++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  }
}
