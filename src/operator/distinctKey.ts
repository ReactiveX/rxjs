import {distinct} from './distinct';
import {Observable} from '../Observable';

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items,
 * using a property accessed by using the key provided to check if the two items are distinct.
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * If a comparator function is not provided, an equality check is used by default.
 * As the internal HashSet of this operator grows larger and larger, care should be taken in the domain of inputs this operator may see.
 * An optional parameter is also provided such that an Observable can be provided to queue the internal HashSet to flush the values it holds.
 * @param {string} key string key for object property lookup on each item.
 * @param {function} [compare] optional comparison function called to test if an item is distinct from previous items in the source.
 * @param {Observable} [flushes] optional Observable for flushing the internal HashSet of the operator.
 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
 * @method distinctKey
 * @owner Observable
 */
export function distinctKey<T>(key: string, compare?: (x: T, y: T) => boolean, flushes?: Observable<any>): Observable<T> {
  return distinct.call(this, function(x: T, y: T) {
    if (compare) {
      return compare(x[key], y[key]);
    }
    return x[key] === y[key];
  }, flushes);
}

export interface DistinctKeySignature<T> {
  (key: string): Observable<T>;
  <K>(key: string, compare: (x: K, y: K) => boolean, flushes?: Observable<any>): Observable<T>;
}
