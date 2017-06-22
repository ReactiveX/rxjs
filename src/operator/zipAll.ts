import { ZipOperator } from './zip';
import { Observable, ObservableInput } from '../Observable';

export function zipAll<T>(this: Observable<ObservableInput<T>>): Observable<T[]>;
export function zipAll<T, R>(this: Observable<ObservableInput<T>>, project: (...values: T[]) => R): Observable<R>;
export function zipAll<T, R>(this: Observable<T>, project?: (...values: any[]) => R): Observable<R>;
/**
 * @param project
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method zipAll
 * @owner Observable
 */
export function zipAll<T, R>(this: Observable<T>, project?: (...values: Array<any>) => R): Observable<R> {
  return this.lift(new ZipOperator(project));
}
