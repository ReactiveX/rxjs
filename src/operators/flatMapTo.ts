import Observable from '../Observable';
import { FlatMapToOperator } from './flatMapTo-support';

export default function flatMapTo<T, R, R2>(observable: Observable<R>,
                                        resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2,
                                        concurrent: number = Number.POSITIVE_INFINITY) : Observable<R2> {
  return this.lift(new FlatMapToOperator(observable, resultSelector, concurrent));
}