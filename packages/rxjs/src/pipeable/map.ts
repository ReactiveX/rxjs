import { mapOperator } from './map-operator.js';
import { operate } from './operate.js';
import type { OperatorFunction } from './types.js';

/**
 * Projects every source value into a new value.
 *
 * The projector receives the source value and a zero-based index scoped to one
 * active producer run. Concurrent observers of a platform Observable share
 * that producer run and index; after ref-count closure, a later activation
 * starts again at index `0`.
 *
 * Errors thrown by `project` are delivered to the result Observable and close
 * the active upstream work.
 *
 * @typeParam In The source value type.
 * @typeParam Out The projected value type.
 * @param project Converts each source value and index into a result value.
 * @returns A unary operator for use with `rx` or another composition helper.
 *
 * @example Double a sequence of numbers
 * ```ts
 * import { map, rx } from 'rxjs';
 *
 * const doubled = rx(
 *   [1, 2, 3],
 *   map((value) => value * 2)
 * );
 *
 * doubled.subscribe(console.log); // 2, 4, 6
 * ```
 */
export function map<In, Out>(project: (value: In, index: number) => Out): OperatorFunction<In, Out> {
  return operate(mapOperator(project));
}
