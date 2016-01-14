import {Observable} from '../Observable';
import {ReduceOperator} from './reduce-support';

/**
 * Returns an Observable that applies a specified accumulator function to the first item emitted by a source Observable,
 * then feeds the result of that function along with the second item emitted by the source Observable into the same
 * function, and so on until all items have been emitted by the source Observable, and emits the final result from
 * the final call to your function as its sole item.
 * This technique, which is called "reduce" here, is sometimes called "aggregate," "fold," "accumulate," "compress," or
 * "inject" in other programming contexts.
 *
 * <img src="./img/reduce.png" width="100%">
 *
 * @param {initialValue} the initial (seed) accumulator value
 * @param {accumulator} an accumulator function to be invoked on each item emitted by the source Observable, the
 * result of which will be used in the next accumulator call.
 * @returns {Observable} an Observable that emits a single item that is the result of accumulating the output from the
 * items emitted by the source Observable.
 */
export function reduce<T, R>(project: (acc: R, value: T) => R, seed?: R): Observable<R> {
  return this.lift(new ReduceOperator(project, seed));
}
