import {FindValueOperator} from './find-support';
import {Observable} from '../Observable';

/**
 * Returns an Observable that searches for the first item in the source Observable that
 * matches the specified condition, and returns the first occurence in the source.
 * @param {function} predicate function called with each item to test for condition matching.
 * @returns {Observable} an Observable of the first item that matches the condition.
 */
export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T> {
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate is not a function');
  }
  return this.lift(new FindValueOperator(predicate, this, false, thisArg));
}
