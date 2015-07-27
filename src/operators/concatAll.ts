import {MergeOperator} from './merge';

export default function concatAll() {
  return this.lift(new MergeOperator(1));
}
