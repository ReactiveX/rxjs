import { Observable, operate } from '@rxjs/observable';
import { EmptyError } from '../util/EmptyError.js';
import type { OperatorFunction, TruthyTypesOf } from '../types.js';
import { filter } from './filter.js';
import { take } from './take.js';

export function first<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export function first<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function first<T, D>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, TruthyTypesOf<T> | D>;
export function first<T, S extends T>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue?: S
): OperatorFunction<T, S>;
export function first<T, S extends T, D>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue: D
): OperatorFunction<T, S | D>;
export function first<T, D = T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  defaultValue?: D
): OperatorFunction<T, T | D>;

/**
 * Emits only the first value (or the first value that meets some condition)
 * emitted by the source Observable.
 *
 * <span class="informal">Emits only the first value. Or emits only the first
 * value that passes some test.</span>
 *
 * ![](first.png)
 *
 * If called with no arguments, `first` emits the first value of the source
 * Observable, then completes. If called with a `predicate` function, `first`
 * emits the first value of the source that matches the specified condition. Emits an error
 * notification if `defaultValue` was not provided and a matching element is not found.
 *
 * ## Examples
 *
 * Emit only the first click that happens on the DOM
 *
 * ```ts
 * import { fromEvent, first } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(first());
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Emits the first click that happens on a DIV
 *
 * ```ts
 * import { fromEvent, first } from 'rxjs';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(first(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link filter}
 * @see {@link find}
 * @see {@link take}
 * @see {@link last}
 *
 * @throws {EmptyError} Delivers an `EmptyError` to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 * This is how `first()` is different from `take(1)` which completes instead.
 *
 * @param predicate An optional function called with each item to test for condition
 * matching.
 * @param defaultValue The default value emitted in case no valid value was found on
 * the source.
 * @return A function that returns an Observable that emits the first item that
 * matches the condition.
 */
export function first<T, D>(
  predicate?: ((value: T, index: number, source: Observable<T>) => boolean) | null,
  defaultValue?: D
): OperatorFunction<T, T | D> {
  const hasDefaultValue = arguments.length >= 2;
  return (source) =>
    new Observable((destination) => {
      let index = 0;
      const operatorSubscriber = operate<T, T | D>({
        destination,
        next: (value) => {
          const passed = predicate ? predicate(value, index++, source) : true;
          if (passed) {
            // We want to unsubscribe from the source as soon as we know
            // we can. This will prevent reentrancy issues if calling
            // `destination.next()` happens to emit another value from source.
            operatorSubscriber.unsubscribe();
            destination.next(value);
            destination.complete();
          }
        },
        complete: () => {
          if (hasDefaultValue) {
            destination.next(defaultValue!);
            destination.complete();
          } else {
            destination.error(new EmptyError());
          }
        },
      });
      source.subscribe(operatorSubscriber);
    });
}
