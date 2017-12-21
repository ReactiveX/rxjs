import { Observable } from '../Observable';
import { EmptyError } from '../util/EmptyError';
import { OperatorFunction, MonoTypeOperatorFunction } from '../interfaces';

import { concat } from '../observable/concat';
import { filter } from './filter';
import { of } from '../observable/of';
import { _throw } from '../observable/throw';
import { identity } from '../util/identity';
import { take } from './take';
import { map } from './map';
import { pipe } from '../util/pipe';

/* tslint:disable:max-line-length */
export function first<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export function first<T, S extends T, R>(predicate: (value: T | S, index: number) => value is S,
                                         resultSelector: (value: S, index: number) => R, defaultValue?: R): OperatorFunction<T, R>;
export function first<T, S extends T>(predicate: (value: T, index: number) => value is S,
                                      resultSelector: void,
                                      defaultValue?: S): OperatorFunction<T, S>;
export function first<T>(predicate?: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;
export function first<T, R>(predicate: (value: T, index: number) => boolean,
                            resultSelector?: (value: T, index: number) => R,
                            defaultValue?: R): OperatorFunction<T, R>;
export function first<T>(predicate: (value: T, index: number) => boolean,
                         resultSelector: void,
                         defaultValue?: T): MonoTypeOperatorFunction<T>;

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
 * @param {function(value: T, index: number): boolean} [predicate]
 * An optional function called with each item to test for condition matching.
 * @param {function(value: T, index: number): R} [resultSelector] A function to
 * produce the value on the output Observable based on the values
 * and the indices of the source Observable. The arguments passed to this
 * function are:
 * - `value`: the value that was emitted on the source.
 * - `index`: the "index" of the value from the source.
 * @param {R} [defaultValue] The default value emitted in case no valid value
 * was found on the source.
 * @return {Observable<T|R>} An Observable of the first item that matches the
 * condition.
 * @method first
 * @owner Observable
 */
export function first<T, R>(predicate?: (value: T, index: number) => boolean,
                            resultSelector?: ((value: T, index: number) => R) | void,
                            defaultValue?: R): OperatorFunction<T, T | R> {
  let operate: OperatorFunction<T, T|R>;

  if (!predicate) {
    if (resultSelector) {
      operate = map(resultSelector);
    } else {
      operate = identity;
    }
  } else {
    if (resultSelector) {
      operate = pipe(
        map((value, index) => ({ value, index })),
        filter(({ value, index }) => predicate(value, index)),
        map(({ value, index }) => resultSelector(value, index))
      );
    } else {
      operate = filter(predicate);
    }
  }

  const after = defaultValue ? of(defaultValue) : _throw(new EmptyError());

  return (source: Observable<T>) =>
    concat(
      source.pipe(operate),
      after,
    ).pipe(take(1));
}
