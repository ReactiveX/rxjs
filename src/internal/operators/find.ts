/** @prettier */
import { OperatorFunction } from '../types';
import { createBasicSyncOperator } from './createBasicSyncOperator';

export function find<T, S extends T>(predicate: (value: T, index: number) => value is S, thisArg?: any): OperatorFunction<T, S | undefined>;
export function find<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): OperatorFunction<T, T | undefined>;
/**
 * Emits only the first value emitted by the source Observable that meets some
 * condition.
 *
 * <span class="informal">Finds the first value that passes some test and emits
 * that.</span>
 *
 * ![](find.png)
 *
 * `find` searches for the first item in the source Observable that matches the
 * specified condition embodied by the `predicate`, and returns the first
 * occurrence in the source. Unlike {@link first}, the `predicate` is required
 * in `find`, and does not emit an error if a valid value is not found.
 *
 * ## Example
 * Find and emit the first click that happens on a DIV element
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { find } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(find(ev => ev.target.tagName === 'DIV'));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link filter}
 * @see {@link first}
 * @see {@link findIndex}
 * @see {@link take}
 *
 * @param {function(value: T, index: number, source: Observable<T>): boolean} predicate
 * A function called with each item to test for condition matching.
 * @param {any} [thisArg] An optional argument to determine the value of `this`
 * in the `predicate` function.
 * @return {Observable<T>} An Observable of the first item that matches the
 * condition.
 * @name find
 */
export function find<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): OperatorFunction<T, T | undefined> {
  return createFind(predicate, thisArg, 'value');
}

export function createFind<T>(predicate: (value: T, index: number) => boolean, thisArg: any, emit: 'value'): OperatorFunction<T, T>;
export function createFind<T>(predicate: (value: T, index: number) => boolean, thisArg: any, emit: 'index'): OperatorFunction<T, number>;

export function createFind<T>(
  predicate: (value: T, index: number) => boolean,
  thisArg: any,
  emit: 'value' | 'index'
): OperatorFunction<T, T | number> {
  const findIndex = emit === 'index';
  return createBasicSyncOperator(
    (value, i, subscriber) => {
      if (predicate.call(thisArg, value, i)) {
        subscriber.next(findIndex ? i : value);
        subscriber.complete();
      }
    },
    (subscriber) => {
      subscriber.next(findIndex ? -1 : undefined);
      subscriber.complete();
    }
  );
}
