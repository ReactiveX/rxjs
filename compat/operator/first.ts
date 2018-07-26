import { Observable } from 'rxjs';
import { first as higherOrder } from 'rxjs/operators';

/* tslint:disable:max-line-length */
export function first<T, D = T>(this: Observable<T>, predicate?: null, defaultValue?: D): Observable<T | D>;
export function first<T, S extends T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): Observable<S>;
export function first<T, D = T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): Observable<T | D>;
/* tslint:enable:max-line-length */

/**
 * Emits only the first value (or the first value that meets some condition)
 * emitted by the source Observable.
 *
 * <span class="informal">Emits only the first value. Or emits only the first
 * value that passes some test.</span>
 *
 * <img src="./img/first.png" width="100%">
 *
 * If called with no arguments, `first` emits the first value of the source
 * Observable, then completes. If called with a `predicate` function, `first`
 * emits the first value of the source that matches the specified condition. It
 * may also take a `resultSelector` function to produce the output value from
 * the input value, and a `defaultValue` to emit in case the source completes
 * before it is able to emit a valid value. Throws an error if `defaultValue`
 * was not provided and a matching element is not found.
 *
 * @example <caption>Emit only the first click that happens on the DOM</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.first();
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>Emits the first click that happens on a DIV</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.first(ev => ev.target.tagName === 'DIV');
 * result.subscribe(x => console.log(x));
 *
 * @see {@link filter}
 * @see {@link find}
 * @see {@link take}
 *
 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 *
 * @param {function(value: T, index: number, source: Observable<T>): boolean} [predicate]
 * An optional function called with each item to test for condition matching.
 * @param {T} [defaultValue] The default value emitted in case no valid value
 * was found on the source.
 * @return {Observable<T>} An Observable of the first item that matches the
 * condition.
 * @method first
 * @owner Observable
 */
export function first<T>(this: Observable<T>, ...args: any[]): Observable<T> {
  return higherOrder<T>(...args)(this);
}
