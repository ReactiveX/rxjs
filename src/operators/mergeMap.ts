import {Observable} from '../Observable';
import {MergeMapOperator} from './mergeMap-support';
import {_MergeMapProjector, _SwitchMapResultSelector} from '../types';

export function mergeMap<T, R>(project: _MergeMapProjector<T, R>): Observable<R>;
export function mergeMap<T, R, R2>(project: _MergeMapProjector<T, R>,
                                   resultSelector: _SwitchMapResultSelector<T, R, R2>,
                                   concurrent?: number): Observable<R>;
export function mergeMap(project: _MergeMapProjector<any, any>,
                         resultSelector?: _SwitchMapResultSelector<any, any, any>,
                         concurrent: number = Number.POSITIVE_INFINITY) {
  return this.lift(new MergeMapOperator(project, resultSelector, concurrent));
}
