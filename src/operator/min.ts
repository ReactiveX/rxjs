import {Observable} from '../Observable';
import {ReduceOperator} from './reduce-support';

/**
 * The Min operator operates on an Observable that emits numbers (or items that can be evaluated as numbers),
 * and when source Observable completes it emits a single item: the item with the smallest number.
 *
 * <img src="./img/min.png" width="100%">
 *
 * @param {Function} optional comparer function that it will use instead of its default to compare the value of two items.
 * @returns {Observable<R>} an Observable that emits item with the smallest number.
 */
export function min<T, R>(comparer?: (x: R, y: T) => R): Observable<R> {
  const min = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x < y ? x : y;
  return this.lift(new ReduceOperator(min));
}
