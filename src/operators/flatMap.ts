import Observable from '../Observable';
import { FlatMapOperator } from './flatMap-support';

export default function flatMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                      resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R,
                                      concurrent: number = Number.POSITIVE_INFINITY) {
  return this.lift(new FlatMapOperator(project, resultSelector, concurrent));
}