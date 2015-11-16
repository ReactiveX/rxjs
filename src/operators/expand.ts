import {Observable} from '../Observable';
import {ExpandOperator} from './expand-support';
import {_ObservableMergeMapProjector, _IteratorMergeMapProjector} from '../types';

export function expand<T, R>(project: _ObservableMergeMapProjector<T, R>,
                             concurrent?: number): Observable<R>;
export function expand<T, R>(project: _IteratorMergeMapProjector<T, R>,
                             concurrent?: number): Observable<R>;
export function expand<T, R>(project: any,
                             concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return this.lift(new ExpandOperator<T, R>(project, concurrent));
}
