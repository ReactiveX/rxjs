import {Observable} from '../Observable';
import {ReduceOperator} from './reduce-support';

export function max<T>(comparer?: (value1: T, value2: T) => T): Observable<T> {
  const max: typeof comparer = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x > y ? x : y;
  return this.lift(new ReduceOperator(max));
}
