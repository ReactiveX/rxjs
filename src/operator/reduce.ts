import {Observable} from '../Observable';
import {ReduceOperator} from './reduce-support';

export function reduce<T, R>(project: (acc: R, value: T) => R, seed?: R): Observable<R> {
  return this.lift(new ReduceOperator(project, seed));
}
