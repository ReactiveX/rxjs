import {Observable} from '../Observable';
import {MergeMapOperator} from './mergeMap-support';
import {_ObservableMergeMapProjector, _IteratorMergeMapProjector, _SwitchMapResultSelector} from '../types';

/**
 * Maps values from the source observable into new Observables, then merges them in a serialized fashion,
 * waiting for each one to complete before merging the next.
 *
 * __Warning:__ if incoming values arrive endlessly and faster than the observables they're being mapped
 * to can complete, it will result in memory issues as created observables amass in an unbounded buffer
 * waiting for their turn to be subscribed to.
 *
 * @param {function} project a function to map incoming values into Observables to be concatenated. accepts
 * the `value` and the `index` as arguments.
 * @param {function} [projectResult] an optional result selector that is applied to values before they're
 * merged into the returned observable. The arguments passed to this function are:
 * - `outerValue`: the value that came from the source
 * - `innerValue`: the value that came from the projected Observable
 * - `outerIndex`: the "index" of the value that came from the source
 * - `innerIndex`: the "index" of the value from the projected Observable
 * @returns {Observable} an observable of values merged from the projected Observables as they were subscribed to,
 * one at a time. Optionally, these values may have been projected from a passed `projectResult` argument.
 */
export function concatMap<T, R>(project: _ObservableMergeMapProjector<T, R>): Observable<R>;
export function concatMap<T, R, R2>(project: _ObservableMergeMapProjector<T, R>,
                                    projectResult: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
export function concatMap<T, R>(project: _IteratorMergeMapProjector<T, R>): Observable<R>;
export function concatMap<T, R, R2>(project: _IteratorMergeMapProjector<T, R>,
                                    projectResult: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
export function concatMap(project: any,
                          projectResult?: _SwitchMapResultSelector<any, any, any>): Observable<any> {
  return this.lift(new MergeMapOperator(project, projectResult, 1));
}
