import {Observable} from '../Observable';
import {MergeMapToOperator} from './mergeMapTo-support';

import {_SwitchMapResultSelector} from '../types';

export function mergeMapTo<T, R>(observable: Observable<R>): Observable<R>;
export function mergeMapTo<T, R, R2>(observable: Observable<R>,
                                     resultSelector?: _SwitchMapResultSelector<T, R, R2>,
                                     concurrent?: number): Observable<R2>;
export function mergeMapTo(observable: Observable<any>,
                           resultSelector?: _SwitchMapResultSelector<any, any, any>,
                           concurrent: number = Number.POSITIVE_INFINITY): Observable<any> {
  return this.lift(new MergeMapToOperator(observable, resultSelector, concurrent));
}
