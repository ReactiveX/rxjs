import { Observable, ObservableInput } from 'rxjs';
import { zipAll as higherOrder } from 'rxjs/operators';

export function zipAll<T>(this: Observable<ObservableInput<T>>): Observable<T[]>;
export function zipAll<T, R>(this: Observable<T>): Observable<R[]>;
export function zipAll<T, R>(this: Observable<ObservableInput<T>>, project: (...values: T[]) => R): Observable<R>;
export function zipAll<T, R>(this: Observable<T>, project: (...values: T[]) => R): Observable<R>;
export function zipAll<R>(this: Observable<any>, project: (...values: any[]) => R): Observable<R>;
/**
 * @param project
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method zipAll
 * @owner Observable
 */
export function zipAll<T, R>(this: Observable<ObservableInput<T>>, project?: (...values: Array<any>) => R): Observable<R> {
  return higherOrder<T, R>(project)(this);
}
