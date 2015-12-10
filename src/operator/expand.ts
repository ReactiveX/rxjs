import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {ExpandOperator} from './expand-support';
import {_IndexSelector, ObservableInput} from '../types';

export function expand<T, R>(project: _IndexSelector<T, ObservableInput<R>>,
                             concurrent: number = Number.POSITIVE_INFINITY,
                             scheduler: Scheduler = undefined): Observable<R> {
  concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;

  return this.lift(new ExpandOperator(project, concurrent, scheduler));
}
