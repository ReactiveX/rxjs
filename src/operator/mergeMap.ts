import {Observable} from '../Observable';
import {MergeMapOperator} from './mergeMap-support';
import {_IndexSelector, ObservableInput, _OuterInnerMapResultSelector} from '../types';

export function mergeMap<T, R, TResult>(project: _IndexSelector<T, ObservableInput<R>>,
                                        resultSelector?: _OuterInnerMapResultSelector<T, R, TResult> | number,
                                        concurrent: number = Number.POSITIVE_INFINITY): Observable<TResult> {
  return this.lift(new MergeMapOperator(project, <any>resultSelector, concurrent));
}
