import { Observable } from 'rxjs';
import { race as higherOrder } from 'rxjs/operators';

/* tslint:disable:max-line-length */
export function race<T>(this: Observable<T>, observables: Array<Observable<T>>): Observable<T>;
export function race<T, R>(this: Observable<T>, observables: Array<Observable<T>>): Observable<R>;
export function race<T>(this: Observable<T>, ...observables: Array<Observable<T> | Array<Observable<T>>>): Observable<T>;
export function race<T, R>(this: Observable<T>, ...observables: Array<Observable<any> | Array<Observable<any>>>): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that mirrors the first source Observable to emit an item
 * from the combination of this Observable and supplied Observables.
 * @param {...Observables} ...observables Sources used to race for which Observable emits first.
 * @return {Observable} An Observable that mirrors the output of the first Observable to emit an item.
 * @method race
 * @owner Observable
 */
export function race<T>(this: Observable<T>, ...observables: Array<Observable<T> | Array<Observable<T>>>): Observable<T> {
  return higherOrder(...observables)(this);
}
