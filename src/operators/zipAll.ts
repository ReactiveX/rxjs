import {Observable} from '../Observable';
import {ZipOperator} from './zip-support';

export function zipAll<T, R>(project?: (...values: Array<any>) => R): Observable<R> {
  return this.lift(new ZipOperator(project));
}
