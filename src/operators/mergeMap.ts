import Observable from '../Observable';
import { MergeMapOperator } from './mergeMap-support';

export default function mergeMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                           resultSelector?: (outerValue: T,
                                                             innerValue: R,
                                                             outerIndex: number,
                                                             innerIndex: number) => R,
                                           concurrent: number = Number.POSITIVE_INFINITY) {
  return this.lift(new MergeMapOperator(project, resultSelector, concurrent));
}