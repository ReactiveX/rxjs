import Observable from '../Observable';
import { MergeOperator } from './merge-support';

export default function mergeAll<R>(concurrent?: any): Observable<R> {
  return this.lift(new MergeOperator(concurrent));
}
