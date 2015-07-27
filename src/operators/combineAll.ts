import Observable from '../Observable';
import {CombineLatestOperator} from './combineLatest';

export default function combineAll<T, R>(project?: (...values: Array<any>) => R) {
  return this.lift(new CombineLatestOperator(project));
}
