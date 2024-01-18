import { Observable, operate } from '@rxjs/observable';
import { EmptyError } from '../util/EmptyError.js';
import type { OperatorFunction, TruthyTypesOf } from '../types.js';

export function last<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function last<T, D>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, TruthyTypesOf<T> | D>;
export function last<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export function last<T, S extends T>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue?: S
): OperatorFunction<T, S>;
export function last<T, D = T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  defaultValue?: D
): OperatorFunction<T, T | D>;

/**
 * Returns an Observable that emits only the last item emitted by the source Observable.
 * It optionally takes a predicate function as a parameter, in which case, rather than emitting
 * the last item from the source Observable, the resulting Observable will emit the last item
 * from the source Observable that satisfies the predicate.
 *
 * ![](last.png)
 *
 * It will emit an error notification if the source completes without notification or one that matches
 * the predicate. It returns the last value or if a predicate is provided last value that matches the
 * predicate. It returns the given default value if no notification is emitted or matches the predicate.
 *
 * ## Examples
 *
 * Last alphabet from the sequence
 *
 * ```ts
 * import { from, last } from 'rxjs';
 *
 * const source = from(['x', 'y', 'z']);
 * const result = source.pipe(last());
 *
 * result.subscribe(value => console.log(`Last alphabet: ${ value }`));
 *
 * // Outputs
 * // Last alphabet: z
 * ```
 *
 * Default value when the value in the predicate is not matched
 *
 * ```ts
 * import { from, last } from 'rxjs';
 *
 * const source = from(['x', 'y', 'z']);
 * const result = source.pipe(last(char => char === 'a', 'not found'));
 *
 * result.subscribe(value => console.log(`'a' is ${ value }.`));
 *
 * // Outputs
 * // 'a' is not found.
 * ```
 *
 * @see {@link skip}
 * @see {@link skipUntil}
 * @see {@link skipLast}
 * @see {@link skipWhile}
 * @see {@link first}
 *
 * @throws {EmptyError} Delivers an `EmptyError` to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 *
 * @param predicate The condition any source emitted item has to satisfy.
 * @param defaultValue An optional default value to provide if last `predicate`
 * isn't met or no values were emitted.
 * @return A function that returns an Observable that emits only the last item
 * satisfying the given condition from the source, or an error notification
 * with an `EmptyError` object if no such items are emitted.
 */
export function last<T, D>(
  predicate?: ((value: T, index: number, source: Observable<T>) => boolean) | null,
  defaultValue?: D
): OperatorFunction<T, T | D> {
  const hasDefaultValue = arguments.length >= 2;
  return (source: Observable<T>) =>
    new Observable((destination) => {
      let index = 0;
      let found = false;
      let lastValue: T | D | undefined;
      source.subscribe(
        operate({
          destination,
          next(value) {
            if (!predicate || predicate(value, index++, source)) {
              found = true;
              lastValue = value;
            }
          },
          complete() {
            if (found) {
              destination.next(lastValue!);
              destination.complete();
            } else if (hasDefaultValue) {
              destination.next(defaultValue!);
              destination.complete();
            } else {
              destination.error(new EmptyError());
            }
          },
        })
      );
    });
}
