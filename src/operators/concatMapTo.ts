import Observable from '../Observable';
import { MergeMapToOperator } from './mergeMapTo-support';

export default function concatMapTo<T, R, R2>(observable: Observable<R>,
                                              projectResult?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) : Observable<R2> {
  return this.lift(new MergeMapToOperator(observable, projectResult, 1));
}