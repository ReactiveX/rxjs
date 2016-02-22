import {distinctUntilChanged} from './distinctUntilChanged';
import {Observable} from '../Observable';

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item,
 * using a property accessed by using the key provided to check if the two items are distinct.
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * If a comparator function is not provided, an equality check is used by default.
 * @param {string} key string key for object property lookup on each item.
 * @param {function} [compare] optional comparison function called to test if an item is distinct from the previous item in the source.
 * @return {Observable} an Observable that emits items from the source Observable with distinct values based on the key specified.
 * @method distinctUntilKeyChanged
 * @owner Observable
 */
export function distinctUntilKeyChanged<T>(key: string, compare?: (x: T, y: T) => boolean): Observable<T> {
  return distinctUntilChanged.call(this, function(x: T, y: T) {
    if (compare) {
      return compare(x[key], y[key]);
    }
    return x[key] === y[key];
  });
}

export interface DistinctUntilKeyChangedSignature<T> {
  (key: string): Observable<T>;
  <K>(key: string, compare: (x: K, y: K) => boolean): Observable<T>;
}