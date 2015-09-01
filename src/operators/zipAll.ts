import Observable from '../Observable';
import { ZipOperator } from './zip-support';

export default function zipAll<T, R>(project?: (...values: Array<any>) => R) {
  return this.lift(new ZipOperator(project));
}
