import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * If a comparator function is not provided, an equality check is used by default.
 * As the internal HashSet of this operator grows larger and larger, care should be taken in the domain of inputs this operator may see.
 * An optional parameter is also provided such that an Observable can be provided to queue the internal HashSet to flush the values it holds.
 * @param {function} [compare] optional comparison function called to test if an item is distinct from previous items in the source.
 * @param {Observable} [flushes] optional Observable for flushing the internal HashSet of the operator.
 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
 * @method distinct
 * @owner Observable
 */
export function distinct<T>(compare?: (x: T, y: T) => boolean, flushes?: Observable<any>): Observable<T> {
  return this.lift(new DistinctOperator(compare, flushes));
}

export interface DistinctSignature<T> {
  (compare?: (x: T, y: T) => boolean, flushes?: Observable<any>): Observable<T>;
}

class DistinctOperator<T> implements Operator<T, T> {
  constructor(private compare: (x: T, y: T) => boolean, private flushes: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new DistinctSubscriber(subscriber, this.compare, this.flushes));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class DistinctSubscriber<T> extends OuterSubscriber<T, T> {
  private values: Array<T> = [];

  constructor(destination: Subscriber<T>, compare: (x: T, y: T) => boolean, flushes: Observable<any>) {
    super(destination);
    if (typeof compare === 'function') {
      this.compare = compare;
    }

    if (flushes) {
      this.add(subscribeToResult(this, flushes));
    }
  }

  notifyNext(outerValue: T, innerValue: T,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, T>): void {
    this.values.length = 0;
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, T>): void {
    this._error(error);
  }

  protected _next(value: T): void {
    let found = false;
    const values = this.values;
    const len = values.length;
    try {
      for (let i = 0; i < len; i++) {
        if (this.compare(values[i], value)) {
          found = true;
          return;
        }
      }
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.values.push(value);
    this.destination.next(value);
  }

  private compare(x: T, y: T): boolean {
    return x === y;
  }
}
