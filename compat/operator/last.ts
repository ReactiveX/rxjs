import { Observable } from 'rxjs';
import { last as higherOrder } from 'rxjs/operators';

/* tslint:disable:max-line-length */
export function last<T, D = T>(this: Observable<T>, predicate?: null, defaultValue?: D): Observable<T | D>;
export function last<T, S extends T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): Observable<S>;
export function last<T, D = T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): Observable<T | D>;
/* tslint:enable:max-line-length */
/**
 * Returns an Observable that emits only the last item emitted by the source Observable.
 * It optionally takes a predicate function as a parameter, in which case, rather than emitting
 * the last item from the source Observable, the resulting Observable will emit the last item
 * from the source Observable that satisfies the predicate.
 *
 * <img src="./img/last.png" width="100%">
 *
 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 * @param {function} [predicate] - The condition any source emitted item has to satisfy.
 * @param {any} [defaultValue] - The default value to use if the predicate isn't
 * satisfied, or no values were emitted (if no predicate).
 * @return {Observable} An Observable that emits only the last item satisfying the given condition
 * from the source, or an NoSuchElementException if no such items are emitted.
 * @throws - Throws if no items that match the predicate are emitted by the source Observable.
 * @method last
 * @owner Observable
 */
export function last<T>(this: Observable<T>, ...args: any[]): Observable<T> {
  return higherOrder<T>(...args)(this);
}
