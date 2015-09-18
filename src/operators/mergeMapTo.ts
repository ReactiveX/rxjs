import Observable from '../Observable';
import { MergeMapToOperator } from './mergeMapTo-support';

export default function mergeMapTo<T, R, R2>(observable: Observable<R>,
                                        resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2,
                                        concurrent: number = Number.POSITIVE_INFINITY) : Observable<R2> {
  return this.lift(new MergeMapToOperator(observable, resultSelector, concurrent));
}