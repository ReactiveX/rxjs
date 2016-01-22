import {Observable} from '../Observable';
import {ReduceOperator} from './reduce';

export function min<T>(comparer?: (value1: T, value2: T) => T): Observable<T> {
  const min: typeof comparer = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x < y ? x : y;
  return this.lift(new ReduceOperator(min));
}
