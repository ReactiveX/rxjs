import { subscribeToSource } from '../util/observable-helpers.js';
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
 * @typeParam T The source value type.
 * @typeParam R The projected value type.
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

/** @internal */
export function mapOperator<In, Out>(
  project: (value: In, index: number) => Out
): (source: Observable<In>, subscriber: Subscriber<Out>) => void {
  return (source, subscriber) => {
    let index = 0;

    subscribeToSource(source, subscriber, {
      next(value) {
        subscriber.next(project(value, index++));
      },
    });
  };
}
