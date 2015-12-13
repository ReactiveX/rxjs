import {ZipOperator} from './zip-support';
import {Observable} from '../Observable';

export function zipAll<T, R>(project?: (...values: Array<any>) => R): Observable<R> {
  return this.lift(new ZipOperator(project));
}
