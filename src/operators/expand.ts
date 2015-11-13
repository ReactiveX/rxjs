import {Observable} from '../Observable';
import {ExpandOperator} from './expand-support';
import {_MergeMapProjector} from '../types';

export function expand<T, R>(project: _MergeMapProjector<T, R>,
                             concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return this.lift(new ExpandOperator<T, R>(project, concurrent));
}
