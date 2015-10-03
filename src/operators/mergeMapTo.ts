import Observable from '../Observable';
import { MergeMapToOperator } from './mergeMapTo-support';

export default function mergeMapTo<T, R, R2>(observable: Observable<R>,
                                             resultSelector?: (outerValue: T,
                                                               innerValue: R,
                                                               outerIndex: number,
                                                               innerIndex: number) => R2,
                                             concurrent: number = Number.POSITIVE_INFINITY): Observable<R2> {
  return this.lift(new MergeMapToOperator(observable, resultSelector, concurrent));
}