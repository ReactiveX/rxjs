import {Observable} from '../Observable';
import {ReduceOperator} from './reduce';

/**
 * The Min operator operates on an Observable that emits numbers (or items that can be evaluated as numbers),
 * and when source Observable completes it emits a single item: the item with the smallest number.
 *
 * <img src="./img/min.png" width="100%">
 *
 * @param {Function} optional comparer function that it will use instead of its default to compare the value of two items.
 * @return {Observable<R>} an Observable that emits item with the smallest number.
 * @method min
 * @owner Observable
 */
export function min<T>(comparer?: (x: T, y: T) => T): Observable<T> {
  const min: typeof comparer = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x < y ? x : y;
  return this.lift(new ReduceOperator(min));
}

export interface MinSignature<T> {
  (comparer?: (x: T, y: T) => T): Observable<T>;
}
