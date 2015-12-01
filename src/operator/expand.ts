import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {ExpandOperator} from './expand-support';

export function expand<T, R>(project: (value: T, index: number) => Observable<R>,
                             concurrent: number = Number.POSITIVE_INFINITY,
                             scheduler: Scheduler = undefined): Observable<R> {
  concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;

  return this.lift(new ExpandOperator(project, concurrent, scheduler));
}
