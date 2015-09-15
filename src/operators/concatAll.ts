import { MergeAllOperator } from './mergeAll-support';

export default function concatAll() {
  return this.lift(new MergeAllOperator(1));
}
