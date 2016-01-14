import {Observable} from '../Observable';
import {MergeMapOperator} from './mergeMap-support';

export function mergeMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                   resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2 | number,
                                   concurrent: number = Number.POSITIVE_INFINITY): Observable<R2> {
  return this.lift(new MergeMapOperator(project, <any>resultSelector, concurrent));
}
