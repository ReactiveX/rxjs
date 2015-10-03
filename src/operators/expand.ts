import Observable from '../Observable';
import { ExpandOperator } from './expand-support';

export default function expand<T, R>(project: (value: T, index: number) => Observable<R>,
                                     concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return this.lift(new ExpandOperator(project, concurrent));
}
