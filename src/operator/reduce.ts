import {Observable} from '../Observable';
import {ReduceOperator} from './reduce-support';
import {_Accumulator} from '../types';

export function reduce<T, R>(project: _Accumulator<T, R>, seed?: R): Observable<R> {
  return this.lift(new ReduceOperator(project, seed));
}
