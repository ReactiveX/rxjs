import Observable from '../Observable';
import { FlatMapToOperator } from './flatMapTo-support';

export default function concatMapTo<T, R, R2>(observable: Observable<R>,
                                          projectResult?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) : Observable<R2> {
  return this.lift(new FlatMapToOperator(observable, projectResult, 1));
}