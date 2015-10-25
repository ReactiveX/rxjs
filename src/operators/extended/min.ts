import Observable from '../../Observable';
import { ReduceOperator } from '../reduce-support';

export default function min<T, R>(comparer?: (x: R, y: T) => R): Observable<R> {
  const min = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x < y ? x : y;
  return this.lift(new ReduceOperator(min));
}
