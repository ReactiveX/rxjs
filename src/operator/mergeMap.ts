import {Observable} from '../Observable';
import {MergeMapOperator} from './mergeMap-support';

/**
 * Returns an Observable that emits items based on applying a function that you supply to each item emitted by the
 * source Observable, where that function returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger.
 *
 * <img src="./img/mergeMap.png" width="100%">
 *
 * @param {Function} a function that, when applied to an item emitted by the source Observable, returns an Observable.
 * @returns {Observable} an Observable that emits the result of applying the transformation function to each item
 * emitted by the source Observable and merging the results of the Observables obtained from this transformation
 */
export function mergeMap<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                   resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2 | number,
                                   concurrent: number = Number.POSITIVE_INFINITY): Observable<R2> {
  return this.lift(new MergeMapOperator(project, <any>resultSelector, concurrent));
}
