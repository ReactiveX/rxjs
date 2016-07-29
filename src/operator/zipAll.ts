import {ZipOperator} from './zip';
import {IObservable} from '../Observable';

/**
 * @param project
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method zipAll
 * @owner Observable
 */
export function zipAll<T, R>(project?: (...values: Array<any>) => R): IObservable<R> {
  return this.lift(new ZipOperator(project));
}

export interface ZipAllSignature<T> {
  <R>(project?: (...values: Array<T>) => R): IObservable<R>;
}
