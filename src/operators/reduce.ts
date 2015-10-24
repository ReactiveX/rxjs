import Observable from '../Observable';
import { ReduceOperator } from './reduce-support';

export default function reduce<T, R>(project: (acc: R, x: T) => R, acc?: R): Observable<R> {
  return this.lift(new ReduceOperator(project, acc));
}
