import { subscribeToSource } from '../util/observable-helpers.js';
import { operate } from './operate.js';
import type { MonoTypeOperatorFunction, OperatorFunction, TruthyTypesOf } from './types.js';

/**
 * Emits only source values accepted by a predicate.
 *
 * The predicate receives the source value and a zero-based index scoped to one
 * active producer run. Type-guard predicates narrow the result type, and
 * passing `Boolean` removes values that are always falsy.
 *
 * Errors thrown by `predicate` are delivered to the result Observable and
 * close the active upstream work.
 *
 * @typeParam T The source value type.
 * @typeParam S The narrowed result value type.
 * @param predicate Tests each source value and index.
 * @returns A unary operator for use with `rx` or another composition helper.
 *
 * @example Keep odd numbers and include the source index in a later operator
 * ```ts
 * import { filter, map, rx } from 'rxjs';
 *
 * const labels = rx(
 *   [1, 2, 3, 4],
 *   filter((value) => value % 2 === 1),
 *   map((value, index) => `${index}: ${value}`)
 * );
 *
 * labels.subscribe(console.log); // '0: 1', '1: 3'
 * ```
 */
export function filter<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export function filter<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function filter<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;
export function filter<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let index = 0;

    subscribeToSource(source, subscriber, {
      next(value) {
        if (predicate(value, index++)) {
          subscriber.next(value);
        }
      },
    });
  });
}
