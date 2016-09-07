import { Observable } from '../Observable';
import { ReduceOperator } from './reduce';

/**
 * The Max operator operates on an Observable that emits numbers (or items that can be evaluated as numbers),
 * and when source Observable completes it emits a single item: the item with the largest number.
 *
 * <img src="./img/max.png" width="100%">
 *
 * @param {Function} optional comparer function that it will use instead of its default to compare the value of two
 * items.
 * @return {Observable} an Observable that emits item with the largest number.
 * @method max
 * @owner Observable
 */
export function max<T>(comparer?: (x: T, y: T) => number): Observable<T> {
  const max: (x: T, y: T) => T = (typeof comparer === 'function')
    ? (x, y) => comparer(x, y) > 0 ? x : y
    : (x, y) => x > y ? x : y;
  return this.lift(new ReduceOperator(max));
}

export interface MaxSignature<T> {
  (comparer?: (x: T, y: T) => number): Observable<T>;
}
