import { operate } from './operate.js';
import { takeOperator } from './take-operator.js';
import type { OperatorFunction } from './types.js';

/**
 * Emits at most `count` values from the source, then completes.
 *
 * Reaching the limit cancels upstream work before the last value is delivered,
 * which prevents a synchronous producer from continuing after the result has
 * completed. Counts less than or equal to zero complete without activating the
 * source.
 *
 * @typeParam In The source value type.
 * @param count The maximum number of values to emit.
 * @returns A unary operator for use with `rx` or another composition helper.
 *
 * @example Take the first two values
 * ```ts
 * import { rx, take } from 'rxjs';
 *
 * const firstTwo = rx([1, 2, 3, 4], take(2));
 * firstTwo.subscribe(console.log); // 1, 2
 * ```
 */
export function take<In>(count: number): OperatorFunction<In, In> {
  return operate(takeOperator(count));
}
