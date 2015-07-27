import {MergeOperator} from './merge';

export default function mergeAll(concurrent?: any) {
  return this.lift(new MergeOperator(concurrent));
}
