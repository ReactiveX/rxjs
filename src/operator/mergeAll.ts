import {MergeAllOperator} from './mergeAll-support';

export function mergeAll<T>(concurrent: number = Number.POSITIVE_INFINITY): T {
  return this.lift(new MergeAllOperator(concurrent));
}
