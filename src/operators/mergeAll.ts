import {Observable} from '../Observable';
import {MergeAllOperator} from './mergeAll-support';

export function mergeAll<R>(concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return this.lift(new MergeAllOperator(concurrent));
}
