import {Observable} from '../Observable';
import {MergeMapOperator} from './mergeMap-support';
import {_ObservableMergeMapProjector, _IteratorMergeMapProjector, _SwitchMapResultSelector} from '../types';

export function mergeMap<T, R>(project: _ObservableMergeMapProjector<T, R>): Observable<R>;
export function mergeMap<T, R, R2>(project: _ObservableMergeMapProjector<T, R>,
                                   resultSelector: _SwitchMapResultSelector<T, R, R2>,
                                   concurrent?: number): Observable<R2>;
export function mergeMap<T, R>(project: _IteratorMergeMapProjector<T, R>): Observable<R>;
export function mergeMap<T, R, R2>(project: _IteratorMergeMapProjector<T, R>,
                                   resultSelector: _SwitchMapResultSelector<T, R, R2>,
                                   concurrent?: number): Observable<R2>;
export function mergeMap(project: any,
                         resultSelector?: _SwitchMapResultSelector<any, any, any>,
                         concurrent: number = Number.POSITIVE_INFINITY) {
  return this.lift(new MergeMapOperator(project, resultSelector, concurrent));
}
