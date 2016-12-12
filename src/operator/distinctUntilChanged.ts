import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/* tslint:disable:max-line-length */
export function distinctUntilChanged<T>(this: Observable<T>, compare?: (x: T, y: T) => boolean): Observable<T>;
export function distinctUntilChanged<T, K>(this: Observable<T>, compare: (x: K, y: K) => boolean, keySelector: (x: T) => K): Observable<T>;
/* tslint:disable:max-line-length */

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * If a comparator function is not provided, an equality check is used by default.
 * @param {function} [compare] optional comparison function called to test if an item is distinct from the previous item in the source.
 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
 * @method distinctUntilChanged
 * @owner Observable
 */
export function distinctUntilChanged<T, K>(this: Observable<T>, compare?: (x: K, y: K) => boolean, keySelector?: (x: T) => K): Observable<T> {
  return this.lift(new DistinctUntilChangedOperator<T, K>(compare, keySelector));
}

class DistinctUntilChangedOperator<T, K> implements Operator<T, T> {
  constructor(private compare: (x: K, y: K) => boolean,
              private keySelector: (x: T) => K) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DistinctUntilChangedSubscriber<T, K> extends Subscriber<T> {
  private key: K;
  private hasKey: boolean = false;

  constructor(destination: Subscriber<T>,
              compare: (x: K, y: K) => boolean,
              private keySelector: (x: T) => K) {
    super(destination);
    if (typeof compare === 'function') {
      this.compare = compare;
    }
  }

  private compare(x: any, y: any): boolean {
    return x === y;
  }

  protected _next(value: T): void {

    const keySelector = this.keySelector;
    let key: any = value;

    if (keySelector) {
      key = tryCatch(this.keySelector)(value);
      if (key === errorObject) {
        return this.destination.error(errorObject.e);
      }
    }

    let result: any = false;

    if (this.hasKey) {
      result = tryCatch(this.compare)(this.key, key);
      if (result === errorObject) {
        return this.destination.error(errorObject.e);
      }
    } else {
      this.hasKey = true;
    }

    if (Boolean(result) === false) {
      this.key = key;
      this.destination.next(value);
    }
  }
}
