import {ZipOperator} from './zip';
import {Observable} from '../Observable';

/**
 * @param project
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method zipAll
 * @owner Observable
 */
export function zipAll<T, R>(project?: (...values: Array<any>) => R): Observable<R> {
  return this.lift(new ZipOperator(project));
}

export interface ZipAllSignature<T> {
  <R>(project?: (...values: Array<T>) => R): Observable<R>;
}
