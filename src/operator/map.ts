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
 * @returns {Observable} a observable of projected values
 */
export function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): Observable<R> {
  if (typeof project !== 'function') {
    throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
  }

  const source = this.source;
  const operator = this.operator;

  if (source && operator && operator.transduce) {
    return source.lift(new MapOperator(operator.transduce(project, thisArg), thisArg));
  } else {
    return this.lift(new MapOperator(project, thisArg));
  }
}

class MapOperator<T, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => R, private thisArg: any) {
  }

  transduce(nextOperation: (value: T, index: number) => any, nextThisArg: any): (value: T, index: number) => R {
    const fn = function transducedMap(value: T, index: number) {
      const { project, thisArg, nextOperation, nextThisArg } = (<any>transducedMap);
      return nextOperation.call(nextThisArg, project.call(thisArg, value, index), index);
    };
    (<any>fn).project = this.project;
    (<any>fn).thisArg = this.thisArg;
    (<any>fn).nextOperation = nextOperation;
    (<any>fn).nextThisArg = nextThisArg;
    return fn;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new MapSubscriber(subscriber, this.project, this.thisArg);
  }
}

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
