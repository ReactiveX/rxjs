import {Observable} from '../../Observable';
import {ReduceOperator} from '../reduce-support';
import {_Comparer} from '../../types';

export function max<T>(comparer?: _Comparer<T, T>): Observable<T> {
  const max: typeof comparer = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x > y ? x : y;
  return this.lift(new ReduceOperator(max));
}
