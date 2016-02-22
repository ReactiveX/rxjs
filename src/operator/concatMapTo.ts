import {Observable, ObservableInput} from '../Observable';
import {MergeMapToOperator} from './mergeMapTo';

/**
 * Maps values from the source to a specific observable, and merges them together in a serialized fashion.
 *
 * @param {Observable} observable the observable to map each source value to
 * @param {function} [resultSelector] an optional result selector that is applied to values before they're
 * merged into the returned observable. The arguments passed to this function are:
 * - `outerValue`: the value that came from the source
 * - `innerValue`: the value that came from the projected Observable
 * - `outerIndex`: the "index" of the value that came from the source
 * - `innerIndex`: the "index" of the value from the projected Observable
 * @return {Observable} an observable of values merged together by joining the passed observable
 * with itself, one after the other, for each value emitted from the source.
 * @method concatMapTo
 * @owner Observable
 */
export function concatMapTo<T, I, R>(observable: Observable<I>,
                                     resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R> {
  return this.lift(new MergeMapToOperator(observable, resultSelector, 1));
}

export interface ConcatMapToSignature<T> {
  <R>(observable: ObservableInput<R>): Observable<R>;
  <I, R>(observable: ObservableInput<I>,
         resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
}
