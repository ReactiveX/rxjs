import {Observable} from '../../Observable';
import {ReduceOperator} from '../reduce-support';

import {_Comparer} from '../../types';

export function min<T, R>(comparer?: _Comparer<T, R>): Observable<R> {
  const min = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x < y ? x : y;
  return this.lift(new ReduceOperator(min));
}
