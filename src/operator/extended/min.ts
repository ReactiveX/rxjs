import {Observable} from '../../Observable';
import {ReduceOperator} from '../reduce-support';
import {_Comparer} from '../../types';

export function min<T>(comparer?: _Comparer<T, T>): Observable<T> {
  const min: typeof comparer = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x < y ? x : y;
  return this.lift(new ReduceOperator(min));
}
