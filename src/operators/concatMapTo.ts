import Observable from '../Observable';
import { MergeMapToOperator } from './mergeMapTo-support';

export default function concatMapTo<T, R, R2>(observable: Observable<R>,
                                          projectResult?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) : Observable<R2> {
  return this.lift(new MergeMapToOperator(observable, projectResult, 1));
}