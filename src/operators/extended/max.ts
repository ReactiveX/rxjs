import {Observable} from '../../Observable';
import {ReduceOperator} from '../reduce-support';

import {_Comparer} from '../../types';

export function max<T, R>(comparer?: _Comparer<T, R>): Observable<R> {
  const max = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x > y ? x : y;
  return this.lift(new ReduceOperator(max));
}
