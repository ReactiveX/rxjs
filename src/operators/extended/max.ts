import Observable from '../../Observable';
import { ReduceOperator } from '../reduce-support';

export default function max<T, R>(comparer?: (x: R, y: T) => R): Observable<R> {
  const max = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x > y ? x : y;
  return this.lift(new ReduceOperator(max));
}
