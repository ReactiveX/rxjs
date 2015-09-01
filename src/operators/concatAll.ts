import { MergeOperator } from './merge-support';

export default function concatAll() {
  return this.lift(new MergeOperator(1));
}
