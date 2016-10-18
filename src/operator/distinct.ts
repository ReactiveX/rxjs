import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
import { ISet, Set } from '../util/Set';

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * If a comparator function is not provided, an equality check is used by default.
 * As the internal HashSet of this operator grows larger and larger, care should be taken in the domain of inputs this operator may see.
 * An optional parameter is also provided such that an Observable can be provided to queue the internal HashSet to flush the values it holds.
 * @param {function} [keySelector] optional function to select which value you want to check as distinct
 * @param {function} [compare] optional comparison function called to test if an item is distinct from previous items in the source.
 * @param {Observable} [flushes] optional Observable for flushing the internal HashSet of the operator.
 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
 * @method distinct
 * @owner Observable
 */
export function distinct<T, K>(this: Observable<T>,
                               keySelector?: (value: T) => K,
                               flushes?: Observable<any>): Observable<T> {
  return this.lift(new DistinctOperator(keySelector, flushes));
}

class DistinctOperator<T, K> implements Operator<T, T> {
  constructor(private keySelector: (value: T) => K, private flushes: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source._subscribe(new DistinctSubscriber(subscriber, this.keySelector, this.flushes));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class DistinctSubscriber<T, K> extends OuterSubscriber<T, T> {
  private values: ISet<K> = new Set<K>();

  constructor(destination: Subscriber<T>, private keySelector: (value: T) => K, flushes: Observable<any>) {
    super(destination);

    if (flushes) {
      this.add(subscribeToResult(this, flushes));
    }
  }

  notifyNext(outerValue: T, innerValue: T,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, T>): void {
    this.values.clear();
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, T>): void {
    this._error(error);
  }

  protected _next(value: T): void {
    if (this.keySelector) {
      this._useKeySelector(value);
    } else {
      this._finalizeNext(value, value);
    }
  }

  private _useKeySelector(value: T): void {
    let key: K;
    const { destination } = this;
    try {
      key = this.keySelector(value);
    } catch (err) {
      destination.error(err);
      return;
    }
    this._finalizeNext(key, value);
  }

  private _finalizeNext(key: K|T, value: T) {
    const { values } = this;
    if (!values.has(<K>key)) {
      values.add(<K>key);
      this.destination.next(value);
    }
  }

}
